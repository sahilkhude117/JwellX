import { InventoryStatsParams } from "@/lib/types/inventory/inventory-stats";

export const INVENTORY_QUERY_KEYS = {
  // Inventory Items
  inventory: {
    all: ['inventory'] as const,
    lists: () => [...INVENTORY_QUERY_KEYS.inventory.all, 'list'] as const,
    list: (params?: any) => [...INVENTORY_QUERY_KEYS.inventory.lists(), params] as const,
    details: () => [...INVENTORY_QUERY_KEYS.inventory.all, 'detail'] as const,
    detail: (id: string) => [...INVENTORY_QUERY_KEYS.inventory.details(), id] as const,
    lookup: (params?: any) => [...INVENTORY_QUERY_KEYS.inventory.all, 'lookup', params] as const,
    stats: () => [...INVENTORY_QUERY_KEYS.inventory.all, 'stats'] as const,
    statsWithParams: (params?: InventoryStatsParams) => 
    [...INVENTORY_QUERY_KEYS.inventory.stats(), params] as const,
    lowStock: (threshold?: number) => [...INVENTORY_QUERY_KEYS.inventory.all, 'low-stock', threshold] as const,
  },

  // Stock Adjustments
  stockAdjustments: {
    all: ['stock-adjustments'] as const,
    lists: () => [...INVENTORY_QUERY_KEYS.stockAdjustments.all, 'list'] as const,
    list: (params?: any) => [...INVENTORY_QUERY_KEYS.stockAdjustments.lists(), params] as const,
    details: () => [...INVENTORY_QUERY_KEYS.stockAdjustments.all, 'detail'] as const,
    detail: (id: string) => [...INVENTORY_QUERY_KEYS.stockAdjustments.details(), id] as const,
  },

  // Analytics
  analytics: {
    all: ['inventory-analytics'] as const,
    overview: () => [...INVENTORY_QUERY_KEYS.analytics.all, 'overview'] as const,
    trends: (period: string) => [...INVENTORY_QUERY_KEYS.analytics.all, 'trends', period] as const,
    valuation: () => [...INVENTORY_QUERY_KEYS.analytics.all, 'valuation'] as const,
  },
};