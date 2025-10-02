import { 
  SaleQueryParams, 
  SalePaymentQueryParams, 
  SaleReturnQueryParams, 
  PosSessionQueryParams,
  SalesStatsParams,
  DailySalesSummaryParams
} from "@/lib/types/sales";

export const SALES_QUERY_KEYS = {
  // Sales
  sales: {
    all: ['sales'] as const,
    lists: () => [...SALES_QUERY_KEYS.sales.all, 'list'] as const,
    list: (params?: SaleQueryParams) => [...SALES_QUERY_KEYS.sales.lists(), params] as const,
    details: () => [...SALES_QUERY_KEYS.sales.all, 'detail'] as const,
    detail: (id: string) => [...SALES_QUERY_KEYS.sales.details(), id] as const,
    recent: (limit?: number) => [...SALES_QUERY_KEYS.sales.all, 'recent', limit] as const,
    today: () => [...SALES_QUERY_KEYS.sales.all, 'today'] as const,
    pendingPayments: () => [...SALES_QUERY_KEYS.sales.all, 'pending-payments'] as const,
    lookups: () => [...SALES_QUERY_KEYS.sales.all, 'lookups'] as const,
  },

  // Payments
  payments: {
    all: ['sales-payments'] as const,
    lists: () => [...SALES_QUERY_KEYS.payments.all, 'list'] as const,
    list: (params?: SalePaymentQueryParams) => [...SALES_QUERY_KEYS.payments.lists(), params] as const,
    details: () => [...SALES_QUERY_KEYS.payments.all, 'detail'] as const,
    detail: (id: string) => [...SALES_QUERY_KEYS.payments.details(), id] as const,
    bySale: (saleId: string, params?: SalePaymentQueryParams) => 
      [...SALES_QUERY_KEYS.payments.all, 'by-sale', saleId, params] as const,
  },

  // Returns
  returns: {
    all: ['sales-returns'] as const,
    lists: () => [...SALES_QUERY_KEYS.returns.all, 'list'] as const,
    list: (params?: SaleReturnQueryParams) => [...SALES_QUERY_KEYS.returns.lists(), params] as const,
    details: () => [...SALES_QUERY_KEYS.returns.all, 'detail'] as const,
    detail: (id: string) => [...SALES_QUERY_KEYS.returns.details(), id] as const,
  },

  // POS Sessions
  posSessions: {
    all: ['pos-sessions'] as const,
    lists: () => [...SALES_QUERY_KEYS.posSessions.all, 'list'] as const,
    list: (params?: PosSessionQueryParams) => [...SALES_QUERY_KEYS.posSessions.lists(), params] as const,
    details: () => [...SALES_QUERY_KEYS.posSessions.all, 'detail'] as const,
    detail: (id: string) => [...SALES_QUERY_KEYS.posSessions.details(), id] as const,
    active: () => [...SALES_QUERY_KEYS.posSessions.all, 'active'] as const,
  },

  // Analytics
  analytics: {
    all: ['sales-analytics'] as const,
    stats: (params?: SalesStatsParams) => [...SALES_QUERY_KEYS.analytics.all, 'stats', params] as const,
    dailySummary: (params?: DailySalesSummaryParams) => 
      [...SALES_QUERY_KEYS.analytics.all, 'daily-summary', params] as const,
  },

  // Calculations
  calculations: {
    all: ['sales-calculations'] as const,
    price: (params?: any) => [...SALES_QUERY_KEYS.calculations.all, 'price', params] as const,
  },

  // Rates
  rates: {
    all: ['sales-rates'] as const,
    current: (materialIds?: string[], gemstoneIds?: string[]) => 
      [...SALES_QUERY_KEYS.rates.all, 'current', { materialIds, gemstoneIds }] as const,
  },

  // Invoices
  invoices: {
    all: ['sales-invoices'] as const,
    generate: (saleId: string) => [...SALES_QUERY_KEYS.invoices.all, 'generate', saleId] as const,
  },
};