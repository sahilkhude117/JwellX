// lib/types/inventory/stats.ts
import { BaseStat, StatsHookReturn, BaseStatsParams, BaseApiStatsResponse } from "../stats";

// Inventory-specific stat types
export type InventoryStatType = 'total-items' | 'total-value' | 'total-weight' | 'low-stock';

// Extend BaseStat for inventory
export interface InventoryStat extends BaseStat {
  type: InventoryStatType;
}

// Inventory stats parameters (extends base)
export interface InventoryStatsParams extends BaseStatsParams {}

// API response structure for inventory stats
export interface StatValue {
  current: number;
  chartData: Array<{
    value: number;
    timestamp: string;
    label: string;
  }>;
}

export interface InventoryStatsApiResponse extends BaseApiStatsResponse {
  totalItems: StatValue;
  totalValue: StatValue;
  totalWeight: StatValue;
  lowStockItems: StatValue;
}

// Inventory-specific hook return type
export interface InventoryStatsHookReturn extends StatsHookReturn<InventoryStat> {}