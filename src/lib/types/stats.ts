// lib/types/stats.ts
import { LucideIcon } from 'lucide-react';

export type PredefinedTimePeriod = 'week' | 'month' | 'year' | 'all';

export interface CustomTimePeriod {
  type: 'custom';
  startDate: Date;
  endDate: Date;
  label: string;
}

export type TimePeriod = PredefinedTimePeriod | CustomTimePeriod;

export interface ChartDataPoint {
  value: number;
  timestamp: string;
  label: string;
}

export interface TrendData {
  value: number;
  percentage: number;
  isPositive: boolean;
}

export interface UnitConfig {
  prefix?: string;
  suffix?: string;
}

export interface BaseStat {
  id: string;
  title: string;
  description: string;
  value: number;
  icon: LucideIcon;
  unit?: UnitConfig;
  isValueApprox?: boolean;
  showGraph?: boolean;
  trend: TrendData;
  chartData: ChartDataPoint[];
  timePeriod: TimePeriod;
}

export interface StatsResponse<T extends BaseStat = BaseStat> {
  stats: T[];
  lastUpdated: string;
  timePeriod: TimePeriod;
  shopCreatedAt: string; // Add shop creation date to response
}

export interface StatsHookReturn<T extends BaseStat = BaseStat> {
  data: StatsResponse<T> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isRefetching: boolean;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  availableTimePeriods: TimePeriod[];
  addCustomTimePeriod: (period: CustomTimePeriod) => void;
  removeCustomTimePeriod: (periodId: string) => void;
  shopCreatedAt: Date | null; // Add to hook return
}

export interface TimePeriodConfig {
  label: string;
  value: PredefinedTimePeriod;
  days: number;
}

export interface FormattedValue {
  display: string;
  full: string;
  isApprox: boolean;
}

// Generic stats parameters interface
export interface BaseStatsParams {
  timePeriod?: PredefinedTimePeriod;
  startDate?: string;
  endDate?: string;
}

// Base API response structure
export interface BaseApiStatsResponse {
  lastUpdated: string;
  timePeriod: string;
  shopCreatedAt: string;
}

// Alias for backward compatibility
export type StatCardData = BaseStat;