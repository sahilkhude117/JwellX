import { api } from "@/lib/api";
import { 
    InventoryItemResponse,
    InventoryItemsResponse,
    StockAdjustmentResponse,
    StockAdjustmentsResponse,
    CreateInventoryItemData,
    UpdateInventoryItemData,
    CreateStockAdjustmentData,
    InventoryQueryParams,
    StockAdjustmentQueryParams,
} from "@/lib/types/inventory/inventory";
import { string } from "zod";

export const inventoryApi = {
    getInventoryItems: (params?: InventoryQueryParams) => {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
        if (params?.brandId) searchParams.append('brandId', params.brandId);
        if (params?.supplierId) searchParams.append('supplierId', params.supplierId);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.isRawMaterial !== undefined) {
            searchParams.append('isRawMaterial', params.isRawMaterial.toString());
        }
        if (params?.minWeight) searchParams.append('minWeight', params.minWeight.toString());
        if (params?.maxWeight) searchParams.append('maxWeight', params.maxWeight.toString());
        if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());

        return api.get<InventoryItemsResponse>(`/v1/inventory?${searchParams.toString()}`);
    },

    getInventoryItem: (id: string) =>
        api.get<InventoryItemResponse>(`/v1/inventory/${id}`),

    createInventory: (data: CreateInventoryItemData) => 
        api.post<InventoryItemResponse>(`/v1/inventory`, data),

    updateInventoryItem: (id: string, data: UpdateInventoryItemData) =>
        api.patch<InventoryItemResponse>(`/v1/inventory/${id}`, data),

    deleteInventoryItem: (id: string) =>
        api.delete(`/v1/inventory/${id}`),

    getStockAdjustments: (params?: StockAdjustmentQueryParams) => {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.inventoryItemId) searchParams.append('inventoryItemId', params.inventoryItemId);
        if (params?.userId) searchParams.append('userId', params.userId);
        if (params?.startDate) searchParams.append('startDate', params.startDate);
        if (params?.endDate) searchParams.append('endDate', params.endDate);

        return api.get<StockAdjustmentsResponse>(`/v1/inventory/stock-adjustments?${searchParams.toString()}`);
    },

    createStockAdjustment: (data: CreateStockAdjustmentData) => 
        api.post<StockAdjustmentResponse>(`/v1/inventory/stock-adjustments`, data),

    // lookup endpoints for dropdowns (without pagination)
    getInventoryLookup: (params?: { search?: string; categoryId?: string; status?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
        if (params?.status) searchParams.append('status', params.status);

        return api.get<{ items: Array<{ id: string; name: string; sku: string; quantity: number }> }>(
            `/v1/inventory/lookup?${searchParams.toString()}`
        );
    },

    bulkUpdateStatus: (ids: string[], status: string) => 
        api.patch(`/v1/inventory/bulk/status`, { ids, status }),

    // bulkDelete: (ids: string[]) =>
    //     api.delete('/v1/inventory/bulk', { data: { ids } }),

    // Export
    exportInventory: (params?: InventoryQueryParams) => {
        const searchParams = new URLSearchParams();
        
        if (params?.search) searchParams.append('search', params.search);
        if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
        if (params?.brandId) searchParams.append('brandId', params.brandId);
        if (params?.supplierId) searchParams.append('supplierId', params.supplierId);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.isRawMaterial !== undefined) {
            searchParams.append('isRawMaterial', params.isRawMaterial.toString());
        }

        return api.get(`/v1/inventory/export?${searchParams.toString()}`, {
            responseType: 'blob',
        });
    },

    getInventoryStats: () =>
        api.get<{
            totalItems: number;
            totalValue: number;
            lowStockItems: number;
            outOfStockItems: number;
            categoryBreakdown: Array<{ category: string; count: number; value: number }>;
            statusBreakdown: Array<{ status: string; count: number }>;
        }>(`/v1/inventory/stats`),

    getLowStockItems: (threshold?: number) => {
        const searchParams = new URLSearchParams();
        if (threshold) searchParams.append('threshold', threshold.toString());

        return api.get<{ items: Array<{ id: string; name: string; sku: string; quantity: number; threshold: number }> }>(
            `/v1/inventory/low-stock?${searchParams.toString()}`
        );
    }
}