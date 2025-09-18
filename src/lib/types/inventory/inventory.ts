import { z } from 'zod';
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
  buyingPrice: z.number().positive('Buying price must be positive'),
  isRawMaterial: z.boolean().default(false),
  status: z.nativeEnum(InventoryItemStatus).default(InventoryItemStatus.IN_STOCK),
  
  // Product attributes
  gender: z.string().optional(),
  occasion: z.string().optional(),
  style: z.string().optional(),
  
  // Pricing structure
  makingChargeType: z.nativeEnum(ChargeType),
  makingChargeValue: z.number().min(0, 'Making charge must be zero or positive'),
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
  buyingPrice: number;
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

export interface FormMode {
  mode: 'add' | 'edit';
  itemId?: string;
}

export interface LookupOption {
    value: string;
    label: string;
}

export interface InventoryLookups {
    hsnCodes: LookupOption[];
    occasions: LookupOption[];
    genders: LookupOption[];
    styles: LookupOption[];
    locations: LookupOption[];
}