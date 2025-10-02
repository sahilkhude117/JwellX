import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_REPORTS');
    const { searchParams } = new URL(request.url);

    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to today if no date specified
    const targetDate = date ? new Date(date) : new Date();
    
    // For range queries
    const rangeStart = startDate ? new Date(startDate) : null;
    const rangeEnd = endDate ? new Date(endDate) : null;

    if (rangeStart && rangeEnd) {
      // Return multiple day summaries
      const summaries = await getDailySummariesForRange(session.user.shopId, rangeStart, rangeEnd);
      return NextResponse.json({ summaries });
    } else {
      // Return single day summary
      const summary = await getDailySummary(session.user.shopId, targetDate);
      return NextResponse.json({ summary });
    }

  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily summary' },
      { status: 500 }
    );
  }
}

async function getDailySummary(shopId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const where = {
    shopId,
    saleDate: {
      gte: startOfDay,
      lte: endOfDay
    }
  };

  // Get basic sales stats
  const salesStats = await prisma.sale.aggregate({
    where,
    _count: { id: true },
    _sum: { 
      totalAmount: true,
      discount: true,
      gstAmount: true
    }
  });

  // Get payment method breakdown
  const paymentBreakdown = await prisma.sale.groupBy({
    by: ['paymentMethod'],
    where,
    _sum: { totalAmount: true },
    _count: { id: true }
  });

  // Get top categories and brands
  const categoryStats = await prisma.$queryRaw`
    SELECT 
      c.id as category_id,
      c.name as category_name,
      COUNT(si.id) as sales_count,
      SUM(si.total_amount) as total_amount
    FROM "SaleItem" si
    JOIN "Sale" s ON si.sale_id = s.id
    JOIN "InventoryItem" ii ON si.item_id = ii.id
    JOIN "Category" c ON ii.category_id = c.id
    WHERE s.shop_id = ${shopId}
      AND s.sale_date >= ${startOfDay}
      AND s.sale_date <= ${endOfDay}
    GROUP BY c.id, c.name
    ORDER BY total_amount DESC
    LIMIT 5
  `;

  const brandStats = await prisma.$queryRaw`
    SELECT 
      b.id as brand_id,
      b.name as brand_name,
      COUNT(si.id) as sales_count,
      SUM(si.total_amount) as total_amount
    FROM "SaleItem" si
    JOIN "Sale" s ON si.sale_id = s.id
    JOIN "InventoryItem" ii ON si.item_id = ii.id
    LEFT JOIN "Brand" b ON ii.brand_id = b.id
    WHERE s.shop_id = ${shopId}
      AND s.sale_date >= ${startOfDay}
      AND s.sale_date <= ${endOfDay}
      AND b.id IS NOT NULL
    GROUP BY b.id, b.name
    ORDER BY total_amount DESC
    LIMIT 5
  `;

  // Calculate material sales (simplified for current schema)
  const materialStats = await prisma.$queryRaw`
    SELECT 
      m.type as material_type,
      SUM(iim.weight) as total_weight,
      SUM(si.gold_value) as total_value
    FROM "SaleItem" si
    JOIN "Sale" s ON si.sale_id = s.id
    JOIN "InventoryItem" ii ON si.item_id = ii.id
    JOIN "InventoryItemMaterial" iim ON ii.id = iim.inventory_item_id
    JOIN "Material" m ON iim.material_id = m.id
    WHERE s.shop_id = ${shopId}
      AND s.sale_date >= ${startOfDay}
      AND s.sale_date <= ${endOfDay}
    GROUP BY m.type
  `;

  // Calculate derived values
  const goldWeight = Array.isArray(materialStats) 
    ? materialStats.reduce((sum: number, stat: any) => 
        stat.material_type === 'GOLD' ? sum + Number(stat.total_weight) : sum, 0)
    : 0;

  const goldValue = Array.isArray(materialStats)
    ? materialStats.reduce((sum: number, stat: any) => 
        stat.material_type === 'GOLD' ? sum + Number(stat.total_value) : sum, 0)
    : 0;

  const silverWeight = Array.isArray(materialStats)
    ? materialStats.reduce((sum: number, stat: any) => 
        stat.material_type === 'SILVER' ? sum + Number(stat.total_weight) : sum, 0)
    : 0;

  const silverValue = Array.isArray(materialStats)
    ? materialStats.reduce((sum: number, stat: any) => 
        stat.material_type === 'SILVER' ? sum + Number(stat.total_value) : sum, 0)
    : 0;

  const topCategoryId = Array.isArray(categoryStats) && categoryStats.length > 0
    ? (categoryStats[0] as any).category_id
    : null;

  const topBrandId = Array.isArray(brandStats) && brandStats.length > 0
    ? (brandStats[0] as any).brand_id
    : null;

  return {
    date: startOfDay.toISOString().split('T')[0],
    totalSales: salesStats._count.id,
    totalAmount: salesStats._sum.totalAmount || 0,
    totalDiscount: salesStats._sum.discount || 0,
    totalGst: salesStats._sum.gstAmount || 0,
    cashSales: paymentBreakdown.find(p => p.paymentMethod === 'CASH')?._sum.totalAmount || 0,
    cardSales: paymentBreakdown.find(p => p.paymentMethod === 'CARD')?._sum.totalAmount || 0,
    upiSales: paymentBreakdown.find(p => p.paymentMethod === 'UPI')?._sum.totalAmount || 0,
    otherSales: paymentBreakdown.filter(p => !['CASH', 'CARD', 'UPI'].includes(p.paymentMethod))
      .reduce((sum, p) => sum + (p._sum.totalAmount || 0), 0),
    goldWeight,
    goldValue,
    silverWeight,
    silverValue,
    topCategoryId,
    topBrandId,
    categoryBreakdown: categoryStats,
    brandBreakdown: brandStats,
    paymentMethodBreakdown: paymentBreakdown.map(pm => ({
      method: pm.paymentMethod,
      amount: pm._sum.totalAmount || 0,
      count: pm._count.id
    }))
  };
}

async function getDailySummariesForRange(shopId: string, startDate: Date, endDate: Date) {
  const summaries = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const summary = await getDailySummary(shopId, new Date(currentDate));
    summaries.push(summary);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return summaries;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_REPORTS');
    const body = await request.json();

    const { date } = body;
    const targetDate = date ? new Date(date) : new Date();

    // This endpoint could be used to manually trigger daily summary generation
    // For now, we'll just return the calculated summary
    const summary = await getDailySummary(session.user.shopId, targetDate);

    return NextResponse.json({ 
      message: 'Daily summary generated successfully',
      summary
    });

  } catch (error) {
    console.error('Error generating daily summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily summary' },
      { status: 500 }
    );
  }
}