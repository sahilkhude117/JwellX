
export interface GoldPrice {
  TWENTY_FOUR: string;
  TWENTY_TWO: string;
}

export interface PercentageChange {
  TWENTY_FOUR: string;
  TWENTY_TWO: string;
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

export interface DayGoldData {
  date: string;
  priceLocation: string;
  price: GoldPrice;
  percentageChange: PercentageChange;
  searchId: string;
}

// New interface for daySummary structure
export interface DaySummary {
  [city: string]: {
    [date: string]: DayGoldData;
  };
}

export interface GrowwApiResponse {
  physicalGoldRate: Record<string, PhysicalGoldRate>;
  goldTrend: Record<string, Record<string, GoldTrendData>>;
  daySummary: DaySummary;
  trendingCities: string[];
}

export interface SilverData {
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

export interface MetalRateCard {
  title: string;
  unit: string;
  price: number;
  change: number;
  changePercentage: number;
  date: string;
}

export interface HistoricalDataRow {
  date: string;
  gold22k: {
    price: number;
    change: number;
    changePercentage: number;
  };
  gold24k: {
    price: number;
    change: number;
    changePercentage: number;
  };
  silver: {
    price: number;
    change: number;
    changePercentage: number;
  };
}

export interface TopCityGoldRate {
  city: string;
  displayName: string;
  gold22k: {
    price: number;
    change: number;
    changePercentage: number;
  };
  gold24k: {
    price: number;
    change: number;
    changePercentage: number;
  };
}

export type City = 'delhi' | 'mumbai' | 'pune' | 'chennai';
export type Unit = '1g' | '10g' | '12g' | '1kg';
export type GoldUnit = 'per_gram' | 'per_10_gram' | 'per_tola';

export const SUPPORTED_CITIES: Record<City, string> = {
  delhi: 'Delhi',
  mumbai: 'Mumbai',
  pune: 'Pune',
  chennai: 'Chennai'
};

export const UNITS: Record<Unit, string> = {
  '1g': '1 Gram',
  '10g': '10 Grams',
  '12g': '12 Grams (1 Tola)',
  '1kg': '1 KG'
};

export const GOLD_UNITS: Record<GoldUnit, string> = {
  'per_gram': 'Per Gram',
  'per_10_gram': 'Per 10 Grams',
  'per_tola': 'Per Tola (12g)'
};