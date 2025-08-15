import { inventoryApi } from "@/lib/api/inventory/inventory";
import { CreateInventoryItemData, CreateStockAdjustmentData, InventoryQueryParams, StockAdjustmentQueryParams, UpdateInventoryItemData } from "@/lib/types/inventory/inventory";
import { INVENTORY_QUERY_KEYS } from "@/lib/utils/inventory/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../use-toast";

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

export const useInventoryLookup = (params?: { search?: string; categoryId?: string; status?: string }) => {
    return useQuery({
        queryKey: INVENTORY_QUERY_KEYS.inventory.lookup(params),
        queryFn: () => inventoryApi.getInventoryLookup(params),
        staleTime: Infinity,
    });
};

export const useInventoryStats = () => {
    return useQuery({
        queryKey: INVENTORY_QUERY_KEYS.inventory.stats(),
        queryFn: () => inventoryApi.getInventoryStats(),
        staleTime: Infinity,
    });
};

export const useLowStockItems = (threshold?: number) => {
    return useQuery({
        queryKey: INVENTORY_QUERY_KEYS.inventory.lowStock(threshold),
        queryFn: () => inventoryApi.getLowStockItems(threshold),
        staleTime: Infinity,
    });
};

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

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      inventoryApi.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.all });
      toast({
        title: "Success",
        description: "Inventory items status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory items status",
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

export const useExportInventory = () => {
  return useMutation({
    mutationFn: (params?: InventoryQueryParams) => inventoryApi.exportInventory(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Inventory exported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export inventory",
        variant: "destructive",
      });
    },
  });
};

export const useOptimisticStatusUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        INVENTORY_QUERY_KEYS.inventory.detail(id),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            item: {
              ...old.item,
              status,
            },
          };
        }
      );
      
      return inventoryApi.updateInventoryItem(id, { status } as any);
    },
    onError: (error, { id }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.inventory.detail(id) });
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });
};