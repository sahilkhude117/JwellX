// Defines the units the user can select for display
export type Unit = "gram" | "ten_gram" | "tola";

// Defines the structure for a single point in the historical data
export interface RateHistoryPoint {
  date: string; // YYYY-MM-DD
  GOLD_24K: number;
  GOLD_22K: number;
  SILVER: number;
  PLATINUM: number;
}

// Defines the complete data payload fetched from the API
export interface MetalRatesData {
  lastUpdated: string; // ISO Date String
  baseCurrency: "INR";
  currentRates: {
    GOLD_24K: number;
    GOLD_22K: number;
    SILVER: number;
    PLATINUM: number;
  };
  previousRates: {
    GOLD_24K: number;
    GOLD_22K: number;
    SILVER: number;
    PLATINUM: number;
  };
  history: RateHistoryPoint[];
}