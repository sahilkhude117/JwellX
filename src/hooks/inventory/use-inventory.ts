import { inventoryApi } from "@/lib/api/inventory/inventory";
import { CreateInventoryItemData, CreateStockAdjustmentData, InventoryQueryParams, StockAdjustmentQueryParams, UpdateInventoryItemData } from "@/lib/types/inventory/inventory";
import { INVENTORY_QUERY_KEYS } from "@/lib/utils/inventory/query-keys";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { toast } from "../use-toast";
import { InventoryStatsApiResponse, InventoryStatsParams } from "@/lib/types/inventory/inventory-stats";

export const useInventoryItems = (params?: InventoryQueryParams) => {
    return useQuery({
        queryKey: INVENTORY_QUERY_KEYS.inventory.list(params),
        queryFn: () => inventoryApi.getInventoryItems(params),
        staleTime: Infinity
    });
};

export const useInventoryItem = (id: string) => {
    return useQuery({
        queryKey: INVENTORY_QUERY_KEYS.inventory.detail(id),
        queryFn: () => inventoryApi.getInventoryItem(id),
        enabled: !!id,
        staleTime: Infinity,
    });
};

export const useInventoryStats = (
  params?: InventoryStatsParams,
  options?: {
    staleTime?: number;
    refetchInterval?: number;
    enabled?: boolean;
  }
): UseQueryResult<InventoryStatsApiResponse, Error> => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.inventory.statsWithParams(params),
    queryFn: () => inventoryApi.getInventoryStats(params),
    staleTime: options?.staleTime ?? 24 * 60 * 60 * 1000, 
    refetchInterval: options?.refetchInterval ?? false,
    enabled: options?.enabled ?? true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export const useCreateInventoryItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInventoryItemData) => inventoryApi.createInventory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.all });
            queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.stockAdjustments.all });
            toast({
                title: "Success",
                description: "Inventory item created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create inventory item",
                variant: "destructive",
            });
        },
    })
}

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemData }) =>
      inventoryApi.updateInventoryItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.detail(id) });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.all });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });
};


// export const useBulkDeleteInventoryItems = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (ids: string[]) => inventoryApi.bulkDelete(ids),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.all });
//       toast({
//         title: "Success",
//         description: "Inventory items deleted successfully",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete inventory items",
//         variant: "destructive",
//       });
//     },
//   });
// };

export const useStockAdjustments = (params?: StockAdjustmentQueryParams) => {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stockAdjustments.list(params),
    queryFn: () => inventoryApi.getStockAdjustments(params),
    staleTime: Infinity,
  });
};

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStockAdjustmentData) => inventoryApi.createStockAdjustment(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.stockAdjustments.all });
      queryClient.invalidateQueries({ 
        queryKey: INVENTORY_QUERY_KEYS.inventory.detail(result.adjustment.inventoryItem.id) 
      });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.all });
      toast({
        title: "Success",
        description: "Stock adjustment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create stock adjustment",
        variant: "destructive",
      });
    },
  });
};
