import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';

interface CustomerStatsParams {
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
}

function getDateRange(timePeriod: string, startDate?: string, endDate?: string, shopCreatedAt?: Date) {
  const now = new Date();
  let currentPeriodEnd = new Date(now);
  let currentPeriodStart = new Date(now);

  if (startDate && endDate) {
    currentPeriodStart = new Date(startDate);
    currentPeriodEnd = new Date(endDate);
  } else {
    switch (timePeriod) {
      case 'week':
        currentPeriodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        currentPeriodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        currentPeriodStart.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        currentPeriodStart = shopCreatedAt || new Date('2020-01-01');
        break;
      default:
        currentPeriodStart.setMonth(now.getMonth() - 1);
    }
  }

  // Ensure we don't go before shop creation date
  if (shopCreatedAt && currentPeriodStart < shopCreatedAt) {
    currentPeriodStart = new Date(shopCreatedAt);
  }

  return {
    currentPeriodStart,
    currentPeriodEnd
  };
}

async function generateChartData(
  startDate: Date,
  endDate: Date,
  shopId: string,
  valueField: 'total-customers' | 'new-customers' | 'total-spend' | 'repeat-customers'
): Promise<Array<{ value: number; timestamp: string; label: string }>> {
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let intervalDays = 1;
  let pointCount = diffDays;

  // Adjust interval based on period length
  if (diffDays > 365) {
    intervalDays = 30; // Monthly points
    pointCount = Math.ceil(diffDays / 30);
  } else if (diffDays > 90) {
    intervalDays = 7; // Weekly points
    pointCount = Math.ceil(diffDays / 7);
  } else if (diffDays > 30) {
    intervalDays = 3; // Every 3 days
    pointCount = Math.ceil(diffDays / 3);
  }

  // Limit to max 20 points for performance
  if (pointCount > 20) {
    intervalDays = Math.ceil(diffDays / 20);
    pointCount = 20;
  }

  const points: Array<{ value: number; timestamp: string; label: string }> = [];
  
  // For total customers chart, always start with 0 at the beginning of the period
  if (valueField === 'total-customers') {
    // Check if there are any customers before the start date
    const customersBeforeStart = await prisma.customer.count({
      where: {
        shopId,
        createdAt: { lt: startDate }
      }
    });
    
    // Add starting point
    points.push({
      value: customersBeforeStart,
      timestamp: startDate.toISOString(),
      label: startDate.toLocaleDateString()
    });
  }
  
  for (let i = 0; i < pointCount; i++) {
    const pointDate = new Date(startDate);
    const actualIndex = valueField === 'total-customers' ? i + 1 : i;
    pointDate.setDate(pointDate.getDate() + (actualIndex * intervalDays));
    
    if (pointDate > endDate) break;

    let value = 0;
    const timestamp = pointDate.toISOString();
    const label = pointDate.toLocaleDateString();

    switch (valueField) {
      case 'total-customers':
        // For total customers, show the cumulative count but ensure proper data points
        value = await calculateTotalCustomersAtDate(shopId, pointDate);
        break;
      case 'new-customers':
        const nextPointDateNew = new Date(pointDate);
        nextPointDateNew.setDate(nextPointDateNew.getDate() + intervalDays);
        value = await calculateNewCustomersInPeriod(shopId, pointDate, nextPointDateNew);
        break;
      case 'total-spend':
        // For total-spend chart, show spend in this specific period interval
        const nextPointDateSpend = new Date(pointDate);
        nextPointDateSpend.setDate(nextPointDateSpend.getDate() + intervalDays);
        value = await calculateSpendInPeriod(shopId, pointDate, nextPointDateSpend);
        break;
      case 'repeat-customers':
        value = await calculateRepeatCustomersAtDate(shopId, pointDate);
        break;
    }

    points.push({ value, timestamp, label });
  }

  // For total customers, ensure we add the current total as the last point
  if (valueField === 'total-customers' && points.length > 0) {
    const currentTotal = await calculateTotalCustomersAtDate(shopId, endDate);
    const lastPoint = points[points.length - 1];
    
    // Only add if the last point doesn't already show the current total
    if (lastPoint.value !== currentTotal) {
      points.push({
        value: currentTotal,
        timestamp: endDate.toISOString(),
        label: endDate.toLocaleDateString()
      });
    }
  }

  return points;
}

// Helper function to calculate spend in a specific period
async function calculateSpendInPeriod(shopId: string, startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.sale.aggregate({
    where: {
      shopId,
      saleDate: {
        gte: startDate,
        lt: endDate
      }
    },
    _sum: {
      totalAmount: true
    }
  });
  
  return (result._sum.totalAmount || 0) / 100; // Convert from cents
}

// Helper function to calculate total customers at a specific date
async function calculateTotalCustomersAtDate(shopId: string, date: Date): Promise<number> {
  const count = await prisma.customer.count({
    where: {
      shopId,
      createdAt: { lte: date }
    }
  });
  return count;
}

// Helper function to calculate new customers in a period
async function calculateNewCustomersInPeriod(shopId: string, startDate: Date, endDate: Date): Promise<number> {
  const count = await prisma.customer.count({
    where: {
      shopId,
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    }
  });
  return count;
}

// Helper function to calculate total spend by customers at a specific date
async function calculateTotalSpendAtDate(shopId: string, date: Date): Promise<number> {
  const result = await prisma.sale.aggregate({
    where: {
      shopId,
      saleDate: { lte: date }
    },
    _sum: {
      totalAmount: true
    }
  });
  
  return (result._sum.totalAmount || 0) / 100; // Convert from cents
}

// Helper function to calculate repeat customers at a specific date
async function calculateRepeatCustomersAtDate(shopId: string, date: Date): Promise<number> {
  const customersWithMultiplePurchases = await prisma.customer.findMany({
    where: {
      shopId,
      createdAt: { lte: date }
    },
    include: {
      _count: {
        select: {
          sales: {
            where: {
              saleDate: { lte: date }
            }
          }
        }
      }
    }
  });

  return customersWithMultiplePurchases.filter(customer => customer._count.sales > 1).length;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_CUSTOMERS');
    const { searchParams } = new URL(request.url);
    
    const timePeriod = searchParams.get('timePeriod') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get shop creation date
    const shop = await prisma.shop.findUnique({
      where: { id: session.user.shopId },
      select: { createdAt: true }
    });

    const shopCreatedAt = shop?.createdAt;
    const { currentPeriodStart, currentPeriodEnd } = getDateRange(timePeriod, startDate || undefined, endDate || undefined, shopCreatedAt);

    // Calculate current stats
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Total customers
    const totalCustomers = await prisma.customer.count({
      where: { shopId: session.user.shopId }
    });

    // New customers in current period
    const newCustomers = await prisma.customer.count({
      where: {
        shopId: session.user.shopId,
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      }
    });

    // Total spend by all customers
    const totalSpendResult = await prisma.sale.aggregate({
      where: { shopId: session.user.shopId },
      _sum: { totalAmount: true }
    });
    const totalSpend = (totalSpendResult._sum.totalAmount || 0) / 100; // Convert from cents

    // Repeat customers (customers with more than 1 purchase)
    const customersWithPurchases = await prisma.customer.findMany({
      where: { shopId: session.user.shopId },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });
    const repeatCustomers = customersWithPurchases.filter(customer => customer._count.sales > 1).length;

    // Generate chart data for each metric
    const [
      totalCustomersChart,
      newCustomersChart,
      totalSpendChart,
      repeatCustomersChart
    ] = await Promise.all([
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'total-customers'),
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'new-customers'),
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'total-spend'),
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'repeat-customers'),
    ]);

    return NextResponse.json({
      totalCustomers: {
        current: totalCustomers,
        chartData: totalCustomersChart
      },
      newCustomers: {
        current: newCustomers,
        chartData: newCustomersChart
      },
      totalSpend: {
        current: totalSpend,
        chartData: totalSpendChart
      },
      repeatCustomers: {
        current: repeatCustomers,
        chartData: repeatCustomersChart
      },
      lastUpdated: new Date(),
      shopCreatedAt: shopCreatedAt || new Date()
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
}