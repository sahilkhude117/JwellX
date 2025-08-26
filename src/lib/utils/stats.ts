// lib/utils/stats.ts
import { TimePeriod, PredefinedTimePeriod, FormattedValue, TimePeriodConfig } from '@/lib/types/stats';

// Time period configurations
export const TIME_PERIOD_CONFIGS: Record<PredefinedTimePeriod, TimePeriodConfig> = {
  week: { label: 'Last Week', value: 'week', days: 7 },
  month: { label: 'Last Month', value: 'month', days: 30 },
  year: { label: 'Last Year', value: 'year', days: 365 },
  all: { label: 'All Time', value: 'all', days: -1 }
};

// Format large numbers with approximation
export const formatValue = (
  value: number | string,
  isApprox: boolean = false,
  unit?: { prefix?: string; suffix?: string }
): FormattedValue => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value;
  const prefix = unit?.prefix || '';
  const suffix = unit?.suffix || '';

  if (!isApprox) {
    const fullValue = `${prefix}${numValue.toLocaleString()}${suffix}`;
    return {
      display: fullValue,
      full: fullValue,
      isApprox: false
    };
  }

  let display: string;
  let full: string;

  if (numValue >= 10000000) { // 1 crore
    display = `${prefix}${(numValue / 10000000).toFixed(1)}Cr${suffix}`;
  } else if (numValue >= 100000) { // 1 lakh
    display = `${prefix}${(numValue / 100000).toFixed(1)}L${suffix}`;
  } else if (numValue >= 1000) { // 1 thousand
    display = `${prefix}${(numValue / 1000).toFixed(1)}K${suffix}`;
  } else {
    display = `${prefix}${numValue.toLocaleString()}${suffix}`;
  }

  full = `${prefix}${numValue.toLocaleString()}${suffix}`;

  return {
    display,
    full,
    isApprox: display !== full
  };
};

// Format date for display
export const formatDateForDisplay = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Get date range for time period
export const getDateRangeForPeriod = (period: TimePeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  if (typeof period === 'string') {
    const config = TIME_PERIOD_CONFIGS[period];
    if (config.days === -1) {
      // All time - set start to a very early date
      start.setFullYear(2020, 0, 1);
    } else {
      start.setDate(end.getDate() - config.days);
    }
  } else {
    // Custom period
    start.setTime(period.startDate.getTime());
    end.setTime(period.endDate.getTime());
  }

  return { start, end };
};

// Get time period label
export const getTimePeriodLabel = (period: TimePeriod): string => {
  if (typeof period === 'string') {
    return TIME_PERIOD_CONFIGS[period].label;
  }
  return period.label;
};

// Calculate trend between two values
export const calculateTrend = (chartData: any[]): { value: number; percentage: number; isPositive: boolean } => {
  if (!chartData || chartData.length < 2) {
    return { value: 0, percentage: 0, isPositive: true };
  }

  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  
  if (firstValue === 0) {
    return {
      value: lastValue,
      percentage: lastValue > 0 ? 100 : 0,
      isPositive: lastValue >= 0
    };
  }

  const difference = lastValue - firstValue;
  const percentage = Math.abs((difference / firstValue) * 100);
  
  return {
    value: Math.abs(difference),
    percentage: Math.round(percentage * 10) / 10,
    isPositive: difference >= 0
  };
};

// Validate custom time period
export const validateCustomTimePeriod = (startDate: Date, endDate: Date, shopCreatedAt?: Date): string | null => {
  const now = new Date();
  
  if (startDate >= endDate) {
    return 'Start date must be before end date';
  }
  
  if (endDate > now) {
    return 'End date cannot be in the future';
  }
  
  if (shopCreatedAt && startDate < shopCreatedAt) {
    return `Start date cannot be before shop creation date: ${shopCreatedAt.toLocaleDateString()}`;
  }
  
  const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diffInDays > 365 * 2) {
    return 'Maximum range is 2 years';
  }
  
  if (diffInDays < 1) {
    return 'Minimum range is 1 day';
  }
  
  return null;
};

// Check if shop is old enough for yearly stats
export const isYearlyStatsAvailable = (shopCreatedAt: Date): boolean => {
  const now = new Date();
  const diffInDays = (now.getTime() - shopCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays >= 365;
};

// Get available time periods based on shop creation date
export const getAvailableTimePeriods = (shopCreatedAt?: Date): PredefinedTimePeriod[] => {
  const basePeriods: PredefinedTimePeriod[] = ['week', 'month', 'all'];
  
  if (shopCreatedAt && isYearlyStatsAvailable(shopCreatedAt)) {
    basePeriods.push('year');
  }
  
  return basePeriods;
};

// Convert TimePeriod to API params
export const convertTimePeriodToApiParams = (timePeriod: TimePeriod): { timePeriod?: PredefinedTimePeriod; startDate?: string; endDate?: string } => {
  if (typeof timePeriod === 'string') {
    return { timePeriod };
  } else {
    return {
      startDate: timePeriod.startDate.toISOString(),
      endDate: timePeriod.endDate.toISOString()
    };
  }
};