import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { salesStatsQuerySchema } from '@/lib/validations/sales';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_SALES');
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = salesStatsQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.errors },
        { status: 400 }
      );
    }

    const { startDate, endDate, customerId, categoryId, brandId } = queryResult.data;

    // Build where clause
    const where: any = {
      shopId: session.user.shopId,
    };

    if (customerId) where.customerId = customerId;
    
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    // Item-level filters
    const itemWhere: any = {};
    if (categoryId) itemWhere.categoryId = categoryId;
    if (brandId) itemWhere.brandId = brandId;

    // Get basic sales statistics
    const salesStats = await prisma.sale.aggregate({
      where,
      _count: { id: true },
      _sum: { 
        totalAmount: true,
        discount: true,
        gstAmount: true
      },
      _avg: { totalAmount: true }
    });

    // Get top customers
    const topCustomers = await prisma.sale.groupBy({
      by: ['customerId'],
      where: {
        ...where,
        customerId: { not: null }
      },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5
    });

    // Get customer details for top customers
    const customerIds = topCustomers.map(tc => tc.customerId).filter(Boolean);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds as string[] } },
      select: { id: true, name: true, phoneNumber: true }
    });

    const topCustomersWithDetails = topCustomers.map(tc => {
      const customer = customers.find(c => c.id === tc.customerId);
      return {
        customer,
        totalAmount: tc._sum.totalAmount || 0,
        totalOrders: tc._count.id
      };
    });

    // Get payment method breakdown
    const paymentMethodBreakdown = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    // Get daily trends for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await prisma.$queryRaw`
      SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales,
        SUM(total_amount) as amount
      FROM "Sale"
      WHERE shop_id = ${session.user.shopId}
        AND sale_date >= ${thirtyDaysAgo}
        ${startDate ? `AND sale_date >= ${new Date(startDate)}` : ''}
        ${endDate ? `AND sale_date <= ${new Date(endDate)}` : ''}
      GROUP BY DATE(sale_date)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Get material sales stats
    const materialStats = await prisma.$queryRaw`
      SELECT 
        m.type as material_type,
        SUM(iim.weight) as total_weight,
        SUM(si.gold_value) as total_value,
        AVG(si.gold_rate) as average_rate,
        COUNT(si.id) as sales_count
      FROM "SaleItem" si
      JOIN "Sale" s ON si.sale_id = s.id
      JOIN "InventoryItem" ii ON si.item_id = ii.id
      JOIN "InventoryItemMaterial" iim ON ii.id = iim.inventory_item_id
      JOIN "Material" m ON iim.material_id = m.id
      WHERE s.shop_id = ${session.user.shopId}
        ${startDate ? `AND s.sale_date >= ${new Date(startDate)}` : ''}
        ${endDate ? `AND s.sale_date <= ${new Date(endDate)}` : ''}
      GROUP BY m.type
      ORDER BY total_value DESC
    `;

    // Calculate derived statistics
    const stats = {
      totalSales: salesStats._count.id,
      totalAmount: salesStats._sum.totalAmount || 0,
      averageOrderValue: salesStats._avg.totalAmount || 0,
      totalDiscount: salesStats._sum.discount || 0,
      totalGst: salesStats._sum.gstAmount || 0,
      topCustomers: topCustomersWithDetails,
      paymentMethodBreakdown: paymentMethodBreakdown.map(pm => ({
        method: pm.paymentMethod,
        amount: pm._sum.totalAmount || 0,
        count: pm._count.id
      })),
      dailyTrends: Array.isArray(dailyTrends) ? dailyTrends.map((dt: any) => ({
        date: dt.date,
        sales: Number(dt.sales),
        amount: Number(dt.amount)
      })) : [],
      materialStats: Array.isArray(materialStats) ? materialStats.map((ms: any) => ({
        materialType: ms.material_type,
        totalWeight: Number(ms.total_weight),
        totalValue: Number(ms.total_value),
        averageRate: Number(ms.average_rate),
        salesCount: Number(ms.sales_count)
      })) : []
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales statistics' },
      { status: 500 }
    );
  }
}