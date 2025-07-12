
import { Unit, MetalType, TimePeriod, HistoricalGoldData, HistoricalSilverData } from '../types/settings/metal-rates';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

export const getUnitMultiplier = (unit: Unit): number => {
  switch (unit) {
    case 'per-gram': return 0.1;
    case 'per-10-gram': return 1;
    case 'per-kg': return 100;
    default: return 1;
  }
};

export const getUnitLabel = (unit: Unit): string => {
  switch (unit) {
    case 'per-gram': return 'Per Gram';
    case 'per-10-gram': return 'Per 10 Gram';
    case 'per-kg': return 'Per Kg';
    default: return 'Per 10 Gram';
  }
};

export const getMetalLabel = (metal: MetalType): string => {
  switch (metal) {
    case 'gold-24k': return '24K Gold';
    case 'gold-22k': return '22K Gold';
    case 'silver': return 'Silver';
    default: return 'Gold';
  }
};

export const getPeriodLabel = (period: TimePeriod): string => {
  switch (period) {
    case '10-days': return '10 Days';
    case '30-days': return '30 Days';
    case '3-months': return '3 Months';
    case '1-year': return '1 Year';
    default: return '10 Days';
  }
};

export const getPeriodDays = (period: TimePeriod): number => {
  switch (period) {
    case '10-days': return 10;
    case '30-days': return 30;
    case '3-months': return 90;
    case '1-year': return 365;
    default: return 10;
  }
};

export const getGroupingPeriod = (period: TimePeriod): number => {
  switch (period) {
    case '10-days': return 1; // Daily
    case '30-days': return 5; // 5-day periods
    case '3-months': return 15; // 15-day periods
    case '1-year': return 30; // Monthly
    default: return 1;
  }
};

export const processHistoricalGoldData = (
  data: HistoricalGoldData[],
  metalType: MetalType,
  unit: Unit,
  period: TimePeriod
) => {
  if (!data || data.length === 0) return [];

  const multiplier = getUnitMultiplier(unit);
  const groupingPeriod = getGroupingPeriod(period);
  
  // Group data by periods if needed
  const groupedData = groupingPeriod > 1 
    ? groupDataByPeriod(data, groupingPeriod)
    : data;

  return groupedData.map(item => {
    const price = metalType === 'gold-24k' 
      ? parseFloat(item.price24Cr) / 100 * multiplier
      : parseFloat(item.price22Cr) / 100 * multiplier;
    
    const change = metalType === 'gold-24k'
      ? parseFloat(item.change24Cr) / 100 * multiplier
      : parseFloat(item.change22Cr) / 100 * multiplier;

    return {
      date: formatDate(item.date),
      price: price,
      change: change,
      changePercent: change !== 0 ? (change / (price - change)) * 100 : 0,
    };
  });
};

export const processHistoricalSilverData = (
  data: HistoricalSilverData[],
  unit: Unit,
  period: TimePeriod
) => {
  if (!data || data.length === 0) return [];

  const multiplier = getUnitMultiplier(unit);
  const groupingPeriod = getGroupingPeriod(period);
  
  // Group data by periods if needed
  const groupedData = groupingPeriod > 1 
    ? groupDataByPeriod(data, groupingPeriod)
    : data;

  return groupedData.map(item => {
    const price = parseFloat(item.price10g) * multiplier;
    const change = parseFloat(item.change10g) * multiplier;

    return {
      date: formatDate(item.date),
      price: price,
      change: change,
      changePercent: change !== 0 ? (change / (price - change)) * 100 : 0,
    };
  });
};

const groupDataByPeriod = (data: any[], groupingPeriod: number): any[] => {
  const grouped = [];
  for (let i = 0; i < data.length; i += groupingPeriod) {
    const group = data.slice(i, i + groupingPeriod);
    if (group.length > 0) {
      // Take the last item from each group (most recent in the period)
      grouped.push(group[group.length - 1]);
    }
  }
  return grouped;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

export const calculatePriceChange = (currentPrice: number, previousPrice: number): number => {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

export const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getChangeIcon = (change: number): 'up' | 'down' | 'neutral' => {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
};

export const cities = [
  'Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Bhubaneswar',
  'Chandigarh', 'Coimbatore', 'Guwahati', 'Indore', 'Kanpur', 'Nagpur',
  'Patna', 'Raipur', 'Ranchi', 'Surat', 'Thiruvananthapuram', 'Vadodara',
  'Vijayawada', 'Visakhapatnam'
];

export const defaultSilverPrice = 950; // Mock silver price per 10gm
export const defaultSilverChange = 0.45; // Mock silver change percentage