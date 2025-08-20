Role: You are next js developer having 15+ years of experience in building pos systems frontend for jwellery shops.
Task: You have to create a frontend for /src/inventory/page.tsx which will show some quick stats and table showing inventory items.
this page should have search option below stats to search, empty state, aslo filters which are applicable from api, loading state, and table which should contain, bulk actions, tanstack-react table, (column def etx), data table from shadcn ui. columns should be name, gross weightm qunstatiy, buying price, totla proce., cate, kidly pick and choose as which are most important columns jwellery shop owner would might need you add or skip from above if they are unnecessary.
Instructions:
 - create components 
 - use typescript
 - use shadcn
 - join components in main page can add suspense boundry
 - code should be modular, industry standard and follow solid principles.
 - use the give data's hooks, types, apis to have context of backend and build. 
Data:
1. hooks = (src/hooks/inventory/use-inventory.ts) => export const useInventoryItems = (params?: InventoryQueryParams) => {
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

2. inventoryApi = (src/lib/api/inventory/inventory.ts) => export const inventoryApi = {
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
} 

3. types = (src/lib/types/inventory/inventory.ts) => import { z } from 'zod';
import { 
  InventoryItemStatus, 
  ChargeType, 
  MaterialType, 
  GemstoneShape 
} from '@/generated/prisma';

// Base Inventory Item Schema
export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU too long'),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  huid: z.string().optional(),
  grossWeight: z.number().positive('Gross weight must be positive'),
  wastage: z.number().optional(),
  quantity: z.number().int().positive('Quantity must be positive').default(1),
  location: z.string().optional(),
  sellingPrice: z.number().positive('Selling price must be positive'),
  isRawMaterial: z.boolean().default(false),
  status: z.nativeEnum(InventoryItemStatus).default(InventoryItemStatus.IN_STOCK),
  
  // Product attributes
  gender: z.string().optional(),
  occasion: z.string().optional(),
  style: z.string().optional(),
  
  // Pricing structure
  makingChargeType: z.nativeEnum(ChargeType),
  makingChargeValue: z.number().positive('Making charge value must be positive'),
  
  // Relationships
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid('Invalid brand ID').optional(),
  supplierId: z.string().uuid('Invalid supplier ID').optional(),
  
  // Materials and Gemstones
  materials: z.array(z.object({
    materialId: z.string().uuid('Invalid material ID'),
    weight: z.number().positive('Material weight must be positive'),
    buyingPrice: z.number().positive('Material buying price must be positive'),
  })).min(1, 'At least one material is required'),
  
  gemstones: z.array(z.object({
    gemstoneId: z.string().uuid('Invalid gemstone ID'),
    weight: z.number().positive('Gemstone weight must be positive'),
    buyingPrice: z.number().positive('Gemstone buying price must be positive'),
  })).optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial().extend({
  materials: z.array(z.object({
    materialId: z.string().uuid('Invalid material ID'),
    weight: z.number().positive('Material weight must be positive'),
    buyingPrice: z.number().positive('Material buying price must be positive'),
  })).optional(),
});

// Stock Adjustment Schema
export const createStockAdjustmentSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid inventory item ID'),
  adjustment: z.number().int('Adjustment must be an integer'),
  reason: z.string().min(1, 'Reason is required').max(255, 'Reason too long'),
});

// Response Types
export interface InventoryItemMaterial {
  id: string;
  material: {
    id: string;
    name: string;
    type: MaterialType;
    purity: string;
    defaultRate: number;
    unit: string;
  };
  weight: number;
  buyingPrice: number;
}

export interface InventoryItemGemstone {
  id: string;
  gemstone: {
    id: string;
    name: string;
    shape: GemstoneShape;
    clarity: string;
    color: string;
    defaultRate: number;
    unit: string;
  };
  weight: number;
  buyingPrice: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  hsnCode?: string;
  huid?: string;
  grossWeight: number;
  wastage?: number;
  quantity: number;
  location?: string;
  sellingPrice: number;
  isRawMaterial: boolean;
  status: InventoryItemStatus;
  gender?: string;
  occasion?: string;
  style?: string;
  makingChargeType: ChargeType;
  makingChargeValue: number;
  
  // Relationships
  category: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  updatedBy: {
    id: string;
    name: string;
  };
  
  materials: InventoryItemMaterial[];
  gemstones: InventoryItemGemstone[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StockAdjustment {
  id: string;
  inventoryItem: {
    id: string;
    name: string;
    sku: string;
  };
  adjustment: number;
  reason: string;
  adjustedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

// API Response Types
export interface InventoryItemResponse {
  item: InventoryItem;
}

export interface InventoryItemsResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockAdjustmentResponse {
  adjustment: StockAdjustment;
}

export interface StockAdjustmentsResponse {
  adjustments: StockAdjustment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Input Data Types
export type CreateInventoryItemData = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemData = z.infer<typeof updateInventoryItemSchema>;
export type CreateStockAdjustmentData = z.infer<typeof createStockAdjustmentSchema>;

// Query Parameters
export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  status?: InventoryItemStatus;
  isRawMaterial?: boolean;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface StockAdjustmentQueryParams {
  page?: number;
  limit?: number;
  inventoryItemId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}