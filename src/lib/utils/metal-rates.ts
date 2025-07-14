// utils/metal-rates.ts
import { Unit, GoldUnit } from "../types/settings/metal-rates";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(price);
};

export const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const getChangeColorClass = (change: number): string => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const convertGoldPrice = (pricePerGram: number, unit: Unit): number => {
  switch (unit) {
    case '1g':
      return pricePerGram;
    case '10g':
      return pricePerGram * 10;
    case '12g': // 1 tola
      return pricePerGram * 12;
    case '1kg':
      return pricePerGram * 1000;
    default:
      return pricePerGram;
  }
};

export const convertGoldPriceForTopCities = (pricePerGram: number, unit: GoldUnit): number => {
  switch (unit) {
    case 'per_gram':
      return pricePerGram;
    case 'per_10_gram':
      return pricePerGram * 10;
    case 'per_tola': // 12 grams
      return pricePerGram * 12;
    default:
      return pricePerGram;
  }
};

export const convertSilverPrice = (price10g: number, unit: Unit): number => {
  switch (unit) {
    case '1g':
      return price10g / 10;
    case '10g':
      return price10g;
    case '12g': // 1 tola
      return (price10g / 10) * 12;
    case '1kg':
      return price10g * 100;
    default:
      return price10g;
  }
};

export const parsePrice = (priceStr: string): number => {
  return parseFloat(priceStr.replace(/[^0-9.-]+/g, ''));
};

export const parsePercentage = (percentageStr: string): number => {
  return parseFloat(percentageStr.replace(/[^0-9.-]+/g, ''));
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const time = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return { date, time };
};

export const getCityDisplayName = (cityCode: string): string => {
  const cityMap: Record<string, string> = {
    'delhi': 'Delhi',
    'mumbai': 'Mumbai',
    'pune': 'Pune',
    'chennai': 'Chennai'
  };
  return cityMap[cityCode] || cityCode;
};

export const getUnitDisplayName = (unit: Unit): string => {
  const unitMap: Record<Unit, string> = {
    '1g': '1 Gram',
    '10g': '10 Grams',
    '12g': '12 Grams (1 Tola)',
    '1kg': '1 KG'
  };
  return unitMap[unit];
};

export const getGoldUnitDisplayName = (unit: GoldUnit): string => {
  const unitMap: Record<GoldUnit, string> = {
    'per_gram': 'Per Gram',
    'per_10_gram': 'Per 10 Grams',
    'per_tola': 'Per Tola (12g)'
  };
  return unitMap[unit];
};

export const calculateChange = (current: number, previous: number): { change: number; changePercentage: number } => {
  const change = current - previous;
  const changePercentage = previous !== 0 ? (change / previous) * 100 : 0;
  return { change, changePercentage };
};

export const sortHistoricalData = (data: any[]): any[] => {
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};