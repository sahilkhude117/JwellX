import { api } from "@/lib/api";
import {
  // Main sales types
  SaleWithDetails,
  SalesResponse,
  SaleResponse,
  CreateSaleData,
  UpdateSaleData,
  SaleQueryParams,
  
  // Payment types
  SalePaymentResponse,
  SalePaymentsResponse,
  CreateSalePaymentData,
  SalePaymentQueryParams,
  
  // Return types
  SaleReturnResponse,
  SaleReturnsResponse,
  CreateSaleReturnData,
  SaleReturnQueryParams,
  
  // POS Session types
  PosSessionResponse,
  PosSessionsResponse,
  CreatePosSessionData,
  ClosePosSessionData,
  PosSessionQueryParams,
  
  // Analytics types
  SalesStatsResponse,
  SalesStatsParams,
  DailySalesSummaryResponse,
  DailySalesSummaryParams,
  
  // Calculation types
  PriceCalculationRequest,
  PriceCalculationResponse,
  
  // Bulk operations
  BulkSalesResponse,
  BulkSalesOperation,
  CurrentRateInfo,
} from "@/lib/types/sales";

export const salesApi = {
  // ============ CORE SALES OPERATIONS ============
  
  getSales: (params?: SaleQueryParams) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus);
    if (params?.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.minAmount) searchParams.append('minAmount', params.minAmount.toString());
    if (params?.maxAmount) searchParams.append('maxAmount', params.maxAmount.toString());
    if (params?.posSessionId) searchParams.append('posSessionId', params.posSessionId);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params?.includeItems !== undefined) {
      searchParams.append('includeItems', params.includeItems.toString());
    }

    return api.get<SalesResponse>(`/v1/sales?${searchParams.toString()}`);
  },

  getSale: (id: string, includeItems = true) => {
    const searchParams = new URLSearchParams();
    if (includeItems) searchParams.append('includeItems', 'true');
    
    const queryString = searchParams.toString();
    const url = queryString ? `/v1/sales/${id}?${queryString}` : `/v1/sales/${id}`;
    
    return api.get<SaleResponse>(url);
  },

  createSale: (data: CreateSaleData) =>
    api.post<SaleResponse>('/v1/sales', data),

  updateSale: (id: string, data: UpdateSaleData) =>
    api.patch<SaleResponse>(`/v1/sales/${id}`, data),

  deleteSale: (id: string) =>
    api.delete(`/v1/sales/${id}`),

  duplicateSale: (id: string) =>
    api.post<SaleResponse>(`/v1/sales/${id}/duplicate`),

  // ============ PAYMENT OPERATIONS ============
  
  getSalePayments: (params?: SalePaymentQueryParams) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.saleId) searchParams.append('saleId', params.saleId);
    if (params?.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return api.get<SalePaymentsResponse>(`/v1/sales/payments?${searchParams.toString()}`);
  },

  createSalePayment: (data: CreateSalePaymentData & { saleId: string }) =>
    api.post<SalePaymentResponse>('/v1/sales/payments', data),

  updatePaymentStatus: (paymentId: string, status: string) =>
    api.patch<SalePaymentResponse>(`/v1/sales/payments/${paymentId}`, { status }),

  // ============ RETURN OPERATIONS ============
  
  getSaleReturns: (params?: SaleReturnQueryParams) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.returnType) searchParams.append('returnType', params.returnType);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return api.get<SaleReturnsResponse>(`/v1/sales/returns?${searchParams.toString()}`);
  },

  createSaleReturn: (data: CreateSaleReturnData) =>
    api.post<SaleReturnResponse>('/v1/sales/returns', data),

  // ============ POS SESSION OPERATIONS ============
  
  getPosSessions: (params?: PosSessionQueryParams) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return api.get<PosSessionsResponse>(`/v1/sales/pos-sessions?${searchParams.toString()}`);
  },

  createPosSession: (data: CreatePosSessionData) =>
    api.post<PosSessionResponse>('/v1/sales/pos-sessions', data),

  getActivePosSession: () =>
    api.get<PosSessionResponse>('/v1/sales/pos-sessions/active'),

  closePosSession: (data: ClosePosSessionData) =>
    api.patch<PosSessionResponse>('/v1/sales/pos-sessions/active', data),

  // ============ ANALYTICS & REPORTING ============
  
  getSalesStats: (params?: SalesStatsParams) => {
    const searchParams = new URLSearchParams();
    
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.groupBy) searchParams.append('groupBy', params.groupBy);
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.includePaymentBreakdown !== undefined) {
      searchParams.append('includePaymentBreakdown', params.includePaymentBreakdown.toString());
    }
    if (params?.includeMaterialAnalysis !== undefined) {
      searchParams.append('includeMaterialAnalysis', params.includeMaterialAnalysis.toString());
    }

    return api.get<SalesStatsResponse>(`/v1/sales/stats?${searchParams.toString()}`);
  },

  getDailySalesSummary: (params?: DailySalesSummaryParams) => {
    const searchParams = new URLSearchParams();
    
    if (params?.date) searchParams.append('date', params.date);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return api.get<DailySalesSummaryResponse>(`/v1/sales/daily-summary?${searchParams.toString()}`);
  },

  // ============ PRICING CALCULATIONS ============
  
  calculatePrice: (data: PriceCalculationRequest) =>
    api.post<PriceCalculationResponse>('/v1/sales/calculate', data),

  // ============ RATES ============
  
  getCurrentRates: (materialIds?: string[], gemstoneIds?: string[]) => {
    const searchParams = new URLSearchParams();
    
    if (materialIds?.length) {
      materialIds.forEach(id => searchParams.append('materialIds', id));
    }
    if (gemstoneIds?.length) {
      gemstoneIds.forEach(id => searchParams.append('gemstoneIds', id));
    }

    return api.get<CurrentRateInfo>(`/v1/sales/rates?${searchParams.toString()}`);
  },

  updateRates: (data: {
    materialRates?: Array<{ materialId: string; buyingRate: number; sellingRate: number; }>;
    gemstoneRates?: Array<{ gemstoneId: string; buyingRate: number; sellingRate: number; }>;
  }) =>
    api.post('/v1/sales/rates', data),

  // ============ BULK OPERATIONS ============
  
  bulkOperations: (operations: BulkSalesOperation[]) =>
    api.post<BulkSalesResponse>('/v1/sales/bulk', { operations }),

  bulkDeleteSales: (saleIds: string[], reason?: string) =>
    api.delete('/v1/sales/bulk', undefined, { saleIds, reason }),

  bulkUpdateStatus: (saleIds: string[], status: string, notes?: string) =>
    api.patch('/v1/sales/bulk', { saleIds, status, notes }),

  // ============ EXPORT OPERATIONS ============
  
  exportSales: (params?: SaleQueryParams & { format?: 'csv' | 'xlsx' | 'pdf' }) => {
    const searchParams = new URLSearchParams();
    
    // Add all the same params as getSales
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.customerId) searchParams.append('customerId', params.customerId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus);
    if (params?.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.format) searchParams.append('format', params.format);

    return api.get(`/v1/sales/export?${searchParams.toString()}`, undefined, {
      responseType: 'blob'
    });
  },

  // ============ INVOICE OPERATIONS ============
  
  generateInvoice: (saleId: string) =>
    api.post<{ invoiceUrl: string }>(`/v1/sales/${saleId}/invoice`),

  sendInvoiceEmail: (saleId: string, email?: string) =>
    api.post(`/v1/sales/${saleId}/send-invoice`, { email }),

  printInvoice: (saleId: string) =>
    api.post(`/v1/sales/${saleId}/print`),

  // ============ LOOKUPS & UTILITIES ============
  
  getSaleLookups: () =>
    api.get<{
      paymentMethods: Array<{ label: string; value: string }>;
      saleStatuses: Array<{ label: string; value: string }>;
      discountTypes: Array<{ label: string; value: string }>;
      chargeTypes: Array<{ label: string; value: string }>;
    }>('/v1/sales/lookups'),

  // ============ RECENT & QUICK ACCESS ============
  
  getRecentSales: (limit = 10) =>
    api.get<SalesResponse>(`/v1/sales?limit=${limit}&sortBy=saleDate&sortOrder=desc`),

  getTodaysSales: () => {
    const today = new Date().toISOString().split('T')[0];
    return api.get<SalesResponse>(`/v1/sales?startDate=${today}&endDate=${today}`);
  },

  getPendingPayments: () =>
    api.get<SalesResponse>(`/v1/sales?paymentStatus=PENDING&sortBy=saleDate&sortOrder=asc`),
};