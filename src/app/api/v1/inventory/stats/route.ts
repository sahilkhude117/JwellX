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
        // Go back exactly 30 days, not 1 calendar month
        currentPeriodStart.setDate(now.getDate() - 30);
        break;
      case 'year':
        // Go back exactly 365 days, not 1 calendar year
        currentPeriodStart.setDate(now.getDate() - 365);
        break;
      case 'all':
        currentPeriodStart = shopCreatedAt || new Date('2020-01-01');
        break;
      default:
        currentPeriodStart.setDate(now.getDate() - 30);
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
    intervalDays = 30;
    pointCount = Math.ceil(diffDays / 30);
  } else if (diffDays > 90) {
    intervalDays = 7;
    pointCount = Math.ceil(diffDays / 7);
  } else if (diffDays > 30) {
    intervalDays = 3;
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
    
    // For the last point, use endDate to ensure we capture current state
    const effectiveDate = (i === pointCount - 1) ? endDate : pointDate;
    
    try {
      let value = 0;

      switch (valueField) {
        case 'count':
          // Get ALL current items
          const allItems = await prisma.inventoryItem.findMany({
            where: {
              shopId,
              status: InventoryItemStatus.IN_STOCK
            },
            select: { id: true, createdAt: true }
          });

          // Count items that existed at this point
          for (const item of allItems) {
            if (item.createdAt <= effectiveDate) {
              value++;
            }
          }
          break;

        case 'low-stock':
          value = await calculateLowStockAtDate(shopId, effectiveDate);
          break;

        case 'sum':
          value = await calculateTotalValueAtDate(shopId, effectiveDate);
          break;

        case 'weight':
          value = await calculateTotalWeightAtDate(shopId, effectiveDate);
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
      console.error(`Chart data error for ${pointDate}:`, error);
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

// Helper function to calculate total value at a specific date
async function calculateTotalValueAtDate(shopId: string, date: Date): Promise<number> {
  // Get ALL current items
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      shopId,
      status: InventoryItemStatus.IN_STOCK
    },
    select: {
      id: true,
      sellingPrice: true,
      quantity: true,
      createdAt: true
    }
  });

  let totalValue = 0;
  let includedItems = 0;

  for (const item of inventoryItems) {
    // Only include if item existed at this date
    if (item.createdAt <= date) {
      totalValue += item.sellingPrice * item.quantity;
      includedItems++;
    }
  }

  return totalValue / 100;
}

// Helper function to calculate total weight at a specific date
async function calculateTotalWeightAtDate(shopId: string, date: Date): Promise<number> {
  // Get ALL current items
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      shopId,
      status: InventoryItemStatus.IN_STOCK
    },
    select: {
      id: true,
      grossWeight: true,
      quantity: true,
      createdAt: true
    }
  });

  let totalWeight = 0;

  for (const item of inventoryItems) {
    // Only include if item existed at this date
    if (item.createdAt <= date) {
      // For now, just use current quantity
      totalWeight += item.grossWeight * item.quantity;
    }
  }

  return totalWeight / 1000;
}

// Helper function to calculate quantity of an item at a specific date
async function calculateQuantityAtDate(itemId: string, currentQuantity: number, date: Date): Promise<number> {
  // Get the item's creation info to determine initial quantity
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    select: { quantity: true, createdAt: true }
  });

  if (!item || date < item.createdAt) {
    return 0; // Item didn't exist at this date
  }

  // Get all stock adjustments up to this date
  const adjustmentsUpToDate = await prisma.stockAdjustment.findMany({
    where: {
      inventoryItemId: itemId,
      createdAt: { lte: date }
    },
    select: {
      adjustment: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Start with initial quantity (assumed to be 1 when created, or we could store this)
  // For now, let's work backwards from current quantity
  const totalAdjustmentsAfterDate = await prisma.stockAdjustment.findMany({
    where: {
      inventoryItemId: itemId,
      createdAt: { gt: date }
    },
    select: {
      adjustment: true
    }
  });

  const adjustmentsAfter = totalAdjustmentsAfterDate.reduce((sum, adj) => sum + adj.adjustment, 0);
  return Math.max(0, currentQuantity - adjustmentsAfter);
}

// Helper function to calculate low stock items at a specific date
async function calculateLowStockAtDate(shopId: string, date: Date): Promise<number> {
  // Get ALL current items (not filtered by creation date)
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      shopId,
      status: InventoryItemStatus.IN_STOCK
    },
    select: {
      id: true,
      quantity: true,
      createdAt: true
    }
  });

  let lowStockCount = 0;

  for (const item of inventoryItems) {
    // Only include if item existed at this date
    if (item.createdAt <= date) {
      const quantityAtDate = await calculateQuantityAtDate(item.id, item.quantity, date);
      if (quantityAtDate > 0 && quantityAtDate <= 5) {
        lowStockCount++;
      }
    }
  }

  return lowStockCount;
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

    // Base where for current inventory (all items currently in stock)
    const currentInventoryWhere = {
      shopId: session.user.shopId,
      status: InventoryItemStatus.IN_STOCK,
      quantity: { gt: 0 } // Only items with actual stock
    };

    // Base where for time-filtered queries (for chart data)
    const timeFilteredWhere = {
      shopId: session.user.shopId,
      status: InventoryItemStatus.IN_STOCK,
      createdAt: {
        gte: currentPeriodStart,
        lte: currentPeriodEnd
      }
    };

    // Execute all stat queries in parallel - Use currentInventoryWhere for current totals
    const [
      currentTotalItems,
      inventoryForValue,
      inventoryForWeight,
      currentLowStockItems
    ] = await Promise.all([
      // Count of unique items currently in stock
      prisma.inventoryItem.count({ where: currentInventoryWhere }),
      
      // Get items for value calculation (quantity * sellingPrice) - ALL current inventory
      prisma.inventoryItem.findMany({
        where: currentInventoryWhere,
        select: { sellingPrice: true, quantity: true }
      }),
      
      // Get items for weight calculation (quantity * grossWeight) - ALL current inventory
      prisma.inventoryItem.findMany({
        where: currentInventoryWhere,
        select: { grossWeight: true, quantity: true }
      }),
      
      // Count of low stock items currently
      prisma.inventoryItem.count({
        where: {
          ...currentInventoryWhere,
          quantity: { lte: 5 } // Low stock threshold
        }
      })
    ]);

    // Calculate totals with quantity (converting units for display)
    const currentTotalValue = inventoryForValue.reduce((sum, item) => 
      sum + (item.sellingPrice * item.quantity), 0
    ) / 100; // Convert paise to rupees
    
    const currentTotalWeight = inventoryForWeight.reduce((sum, item) => 
      sum + (item.grossWeight * item.quantity), 0
    ) / 1000; // Convert milligrams to grams

    // Generate chart data - use timeFilteredWhere for historical data
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
        current: currentTotalValue,
        chartData: totalValueChartData
      },
      totalWeight: {
        current: currentTotalWeight,
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