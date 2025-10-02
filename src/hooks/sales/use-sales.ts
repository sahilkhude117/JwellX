import { salesApi } from "@/lib/api/sales/sales";
import { 
  CreateSaleData, 
  UpdateSaleData, 
  SaleQueryParams,
  CreateSalePaymentData,
  SalePaymentQueryParams,
  CreateSaleReturnData,
  SaleReturnQueryParams,
  CreatePosSessionData,
  ClosePosSessionData,
  PosSessionQueryParams,
  SalesStatsParams,
  DailySalesSummaryParams,
  PriceCalculationRequest,
  BulkSalesOperation
} from "@/lib/types/sales";
import { SALES_QUERY_KEYS } from "@/lib/utils/sales/query-keys";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { toast } from "../use-toast";

// ============ CORE SALES HOOKS ============

export const useSales = (params?: SaleQueryParams) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.sales.list(params),
    queryFn: () => salesApi.getSales(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

export const useSale = (id: string, includeItems = true) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.sales.detail(id),
    queryFn: () => salesApi.getSale(id, includeItems),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecentSales = (limit = 10) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.sales.recent(limit),
    queryFn: () => salesApi.getRecentSales(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTodaysSales = () => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.sales.today(),
    queryFn: () => salesApi.getTodaysSales(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const usePendingPayments = () => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.sales.pendingPayments(),
    queryFn: () => salesApi.getPendingPayments(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSaleLookups = () => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.sales.lookups(),
    queryFn: () => salesApi.getSaleLookups(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// ============ SALES MUTATIONS ============

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleData) => salesApi.createSale(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.posSessions.all });
      
      toast({
        title: "Success",
        description: `Sale ${result.sale.billNumber} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sale",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleData }) =>
      salesApi.updateSale(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.detail(id) });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: `Sale ${result.sale.billNumber} updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sale",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesApi.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sale",
        variant: "destructive",
      });
    },
  });
};

export const useDuplicateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesApi.duplicateSale(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      
      toast({
        title: "Success",
        description: `Sale duplicated as ${result.sale.billNumber}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate sale",
        variant: "destructive",
      });
    },
  });
};

// ============ PAYMENT HOOKS ============

export const useSalePayments = (params?: SalePaymentQueryParams) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.payments.list(params),
    queryFn: () => salesApi.getSalePayments(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSalePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalePaymentData & { saleId: string }) => 
      salesApi.createSalePayment(data),
    onSuccess: (result) => {
      const saleId = result.sale.id;
      
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: string }) =>
      salesApi.updatePaymentStatus(paymentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.payments.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    },
  });
};

// ============ RETURN HOOKS ============

export const useSaleReturns = (params?: SaleReturnQueryParams) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.returns.list(params),
    queryFn: () => salesApi.getSaleReturns(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSaleReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleReturnData) => salesApi.createSaleReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.returns.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: "Return processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process return",
        variant: "destructive",
      });
    },
  });
};

// ============ POS SESSION HOOKS ============

export const usePosSessions = (params?: PosSessionQueryParams) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.posSessions.list(params),
    queryFn: () => salesApi.getPosSessions(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useActivePosSession = () => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.posSessions.active(),
    queryFn: () => salesApi.getActivePosSession(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (no active session)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
};

export const useCreatePosSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePosSessionData) => salesApi.createPosSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.posSessions.all });
      
      toast({
        title: "Success",
        description: "POS session started successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start POS session",
        variant: "destructive",
      });
    },
  });
};

export const useClosePosSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClosePosSessionData) => salesApi.closePosSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.posSessions.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: "POS session closed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close POS session",
        variant: "destructive",
      });
    },
  });
};

// ============ ANALYTICS HOOKS ============

export const useSalesStats = (
  params?: SalesStatsParams,
  options?: {
    staleTime?: number;
    refetchInterval?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.analytics.stats(params),
    queryFn: () => salesApi.getSalesStats(params),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval ?? false,
    enabled: options?.enabled ?? true,
    retry: 3,
  });
};

export const useDailySalesSummary = (params?: DailySalesSummaryParams) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.analytics.dailySummary(params),
    queryFn: () => salesApi.getDailySalesSummary(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============ PRICING & RATES HOOKS ============

export const usePriceCalculation = () => {
  return useMutation({
    mutationFn: (data: PriceCalculationRequest) => salesApi.calculatePrice(data),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate price",
        variant: "destructive",
      });
    },
  });
};

export const useCurrentRates = (materialIds?: string[], gemstoneIds?: string[]) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.rates.current(materialIds, gemstoneIds),
    queryFn: () => salesApi.getCurrentRates(materialIds, gemstoneIds),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(materialIds?.length || gemstoneIds?.length),
  });
};

export const useUpdateRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      materialRates?: Array<{ materialId: string; buyingRate: number; sellingRate: number; }>;
      gemstoneRates?: Array<{ gemstoneId: string; buyingRate: number; sellingRate: number; }>;
    }) => salesApi.updateRates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.rates.all });
      
      toast({
        title: "Success",
        description: "Rates updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update rates",
        variant: "destructive",
      });
    },
  });
};

// ============ BULK OPERATIONS HOOKS ============

export const useBulkSalesOperations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operations: BulkSalesOperation[]) => salesApi.bulkOperations(operations),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: `Bulk operation completed. ${result.processed} items processed.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete bulk operation",
        variant: "destructive",
      });
    },
  });
};

export const useBulkDeleteSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleIds, reason }: { saleIds: string[]; reason?: string }) => 
      salesApi.bulkDeleteSales(saleIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: "Sales deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sales",
        variant: "destructive",
      });
    },
  });
};

export const useBulkUpdateSalesStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleIds, status, notes }: { saleIds: string[]; status: string; notes?: string }) =>
      salesApi.bulkUpdateStatus(saleIds, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.all });
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.analytics.all });
      
      toast({
        title: "Success",
        description: "Sales status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sales status",
        variant: "destructive",
      });
    },
  });
};

// ============ INVOICE HOOKS ============

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleId: string) => salesApi.generateInvoice(saleId),
    onSuccess: (result, saleId) => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.sales.detail(saleId) });
      
      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });
};

export const useSendInvoiceEmail = () => {
  return useMutation({
    mutationFn: ({ saleId, email }: { saleId: string; email?: string }) =>
      salesApi.sendInvoiceEmail(saleId, email),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive",
      });
    },
  });
};

export const usePrintInvoice = () => {
  return useMutation({
    mutationFn: (saleId: string) => salesApi.printInvoice(saleId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice sent to printer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to print invoice",
        variant: "destructive",
      });
    },
  });
};

// ============ EXPORT HOOKS ============

export const useExportSales = () => {
  return useMutation({
    mutationFn: (params?: Parameters<typeof salesApi.exportSales>[0]) => 
      salesApi.exportSales(params),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sales export started. File will download shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export sales",
        variant: "destructive",
      });
    },
  });
};