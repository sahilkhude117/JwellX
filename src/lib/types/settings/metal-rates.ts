
export interface GoldPrice {
  TWENTY_FOUR: number;
  TWENTY_TWO: number;
}

export interface PercentageChange {
  TWENTY_FOUR: number;
  TWENTY_TWO: number;
}

export interface PhysicalGoldRate {
  date: string | null;
  priceLocation: string;
  price: GoldPrice;
  percentageChange: PercentageChange;
  searchId: string;
}

export interface GoldTrendData {
  data: string;
  firstDayPrice: GoldPrice;
  lastDayPrice: GoldPrice;
  highest: GoldPrice;
  lowest: GoldPrice;
  overAllPerformance: {
    TWENTY_FOUR: string;
    TWENTY_TWO: string;
  };
  percentageChange: PercentageChange;
}

export interface GrowwApiResponse {
  physicalGoldRate: Record<string, PhysicalGoldRate>;
  goldTrend: Record<string, Record<string, GoldTrendData>>;
  trendingCities: string[];
}

export interface HistoricalGoldData {
  id: string;
  city: string;
  displayName: string;
  state: string;
  date: string;
  price22Cr: string;
  price24Cr: string;
  change22Cr: string;
  change24Cr: string;
}

export interface HistoricalSilverData {
  id: string;
  city: string;
  displayName: string;
  state: string;
  date: string;
  price10g: string;
  price100g: string;
  price1kg: string;
  change10g: string;
  change100g: string;
  change1kg: string;
}

export type MetalType = 'gold-24k' | 'gold-22k' | 'silver';
export type Unit = 'per-gram' | 'per-10-gram' | 'per-kg';
export type TimePeriod = '10-days' | '30-days' | '3-months' | '1-year';

export interface MetalRatesFilters {
  city?: string;
  metal?: MetalType;
  unit?: Unit;
  period?: TimePeriod;
}

export interface ProcessedMetalRate {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}