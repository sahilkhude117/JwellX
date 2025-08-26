import prisma from "@/lib/db";
import { InventoryStatsApiResponse } from "@/lib/types/inventory/inventory-stats";
import { requirePermission } from "@/lib/utils/auth-utils";
import { InventoryItemStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface InventoryStatsParams {
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
    currentPeriodStart = shopCreatedAt;
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
  valueField: 'count' | 'sum' | 'weight' | 'low-stock'
): Promise<Array<{ value: number; timestamp: string; label: string }>> {
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let intervalDays = 1;
  let pointCount = diffDays;

  // Adjust interval based on period length
  if (diffDays > 365) {
    intervalDays = 30; // Monthly points for > 1 year
    pointCount = Math.ceil(diffDays / 30);
  } else if (diffDays > 90) {
    intervalDays = 7; // Weekly points for > 3 months
    pointCount = Math.ceil(diffDays / 7);
  } else if (diffDays > 30) {
    intervalDays = 3; // Every 3 days for > 1 month
    pointCount = Math.ceil(diffDays / 3);
  }

  // Limit to max 20 points for performance
  if (pointCount > 20) {
    intervalDays = Math.ceil(diffDays / 20);
    pointCount = 20;
  }

  const points: Array<{ value: number; timestamp: string; label: string }> = [];
  
  for (let i = 0; i < pointCount; i++) {
    const pointDate = new Date(startDate.getTime() + (i * intervalDays * 24 * 60 * 60 * 1000));
    const nextPointDate = new Date(Math.min(
      pointDate.getTime() + (intervalDays * 24 * 60 * 60 * 1000),
      endDate.getTime()
    ));
    
    try {
      let value = 0;
      const baseWhere = {
        shopId,
        status: InventoryItemStatus.IN_STOCK,
        createdAt: {
          gte: pointDate,
          lt: nextPointDate
        }
      };

      switch (valueField) {
        case 'count':
          value = await prisma.inventoryItem.count({ where: baseWhere });
          break;
        case 'low-stock':
          value = await prisma.inventoryItem.count({
            where: {
              ...baseWhere,
              quantity: { lte: 5 }
            }
          })
          break;
        case 'sum':
          const sumResult = await prisma.inventoryItem.aggregate({
            where: baseWhere,
            _sum: { sellingPrice: true }
          });
          value = sumResult._sum.sellingPrice || 0;
          break;
        case 'weight':
          const weightResult = await prisma.inventoryItem.aggregate({
            where: baseWhere,
            _sum: { grossWeight: true }
          });
          value = (weightResult._sum.grossWeight || 0) / 1000; // Convert to kg
          break;
      }

      points.push({
        value,
        timestamp: pointDate.toISOString(),
        label: pointDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        })
      });
    } catch (error) {
      // If query fails, add zero value point
      points.push({
        value: 0,
        timestamp: pointDate.toISOString(),
        label: pointDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        })
      });
    }
  }

  return points;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_INVENTORY');

    const { searchParams } = new URL(request.url);
    const timePeriod = searchParams.get('timePeriod') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get shop creation date to validate time periods
    const shop = await prisma.shop.findUnique({
      where: { id: session.user.shopId },
      select: { createdAt: true }
    });

    const shopCreatedAt = shop?.createdAt || new Date('2020-01-01');
    
    const { currentPeriodStart, currentPeriodEnd } = getDateRange(
      timePeriod, 
      startDate || undefined, 
      endDate || undefined, 
      shopCreatedAt
    );

    const baseWhere = {
      shopId: session.user.shopId,
      status: InventoryItemStatus.IN_STOCK,
      createdAt: {
        gte: currentPeriodStart,
        lte: currentPeriodEnd
      }
    };

    // Execute all stat queries in parallel
    const [
      currentTotalItems,
      currentTotalValue,
      currentTotalWeight,
      currentLowStockItems
    ] = await Promise.all([
      prisma.inventoryItem.count({ where: baseWhere }),
      
      prisma.inventoryItem.aggregate({
        where: baseWhere,
        _sum: { sellingPrice: true }
      }),
      
      prisma.inventoryItem.aggregate({
        where: baseWhere,
        _sum: { grossWeight: true }
      }),
      
      prisma.inventoryItem.count({
        where: {
          ...baseWhere,
          quantity: { lte: 5 } // Low stock threshold
        }
      })
    ]);

    // Generate chart data
    const [
      totalItemsChartData,
      totalValueChartData,
      totalWeightChartData,
      lowStockChartData
    ] = await Promise.all([
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'count'),
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'sum'),
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'weight'),
      generateChartData(currentPeriodStart, currentPeriodEnd, session.user.shopId, 'low-stock')
    ]);

    const response: InventoryStatsApiResponse = {
      totalItems: {
        current: currentTotalItems,
        chartData: totalItemsChartData
      },
      totalValue: {
        current: currentTotalValue._sum.sellingPrice || 0,
        chartData: totalValueChartData
      },
      totalWeight: {
        current: (currentTotalWeight._sum.grossWeight || 0) / 1000, // Convert grams to kg
        chartData: totalWeightChartData
      },
      lowStockItems: {
        current: currentLowStockItems,
        chartData: lowStockChartData
      },
      lastUpdated: new Date().toISOString(),
      timePeriod: timePeriod,
      shopCreatedAt: shopCreatedAt.toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Inventory stats API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}