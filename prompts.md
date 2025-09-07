Role:
Task: i am getting this error while updating Error converting field "location" of expected non-nullable type "String", found incompatible value of "MAIN_SHOWROOM".
    at <unknown> (file://E%3A/JwellX/jwellx/src/app/api/v1/inventory/%5Bid%5D/route.ts:285:44)     
    at async PATCH (file://E%3A/JwellX/jwellx/src/app/api/v1/inventory/%5Bid%5D/route.ts:285:17)   
  283 |     }
  284 |
> 285 |     const item = await prisma.inventoryItem.update({
      |                                            ^
  286 |       where: { id },
  287 |       data: updateData,
  288 |       include: { {
  code: 'P2032',
  meta: [Object],
  clientVersion: '6.6.0'
}
 PATCH /api/v1/inventory/71943aaf-884d-46ad-a06b-9e63f854e846 500 in 7753ms.
 resolve this error and make sure everything works fine with this new enum thing that is update and add new too.
Instructions:
1. give updated parts of each file not whole code.
Data:
1. i added enums for location, gender, occasion, style in prisma file. initially i used to pass down it as a prop but that doens got updated in db and it got updated like "".
2. /types/inventory.ts => import { z } from 'zod';
import {
  InventoryItemStatus,
  ChargeType,
  MaterialType,
  GemstoneShape,
  InventoryLocation,
  Gender,
  Occasion,
  Style
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
  location: z.nativeEnum(InventoryLocation).optional(),
  sellingPrice: z.number().positive('Selling price must be positive'),
  buyingPrice: z.number().positive('Buying price must be positive'),
  isRawMaterial: z.boolean().default(false),
  status: z.nativeEnum(InventoryItemStatus).default(InventoryItemStatus.IN_STOCK),

  // Product attributes
  gender: z.nativeEnum(Gender).optional(),
  occasion: z.nativeEnum(Occasion).optional(),
  style: z.nativeEnum(Style).optional(),
  
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
  location?: InventoryLocation;
  sellingPrice: number;
  buyingPrice: number;
  isRawMaterial: boolean;
  status: InventoryItemStatus;
  gender?: Gender;
  occasion?: Occasion;
  style?: Style;
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
3. ProductSection => import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import { generateSKU } from "@/lib/utils/inventory/utils";
import { useEffect } from "react";
import { Control } from "react-hook-form";
import CategorySelector from "../../products/selectors/category-selector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import BrandSelector from "../../products/selectors/brand-selector";
import { Gender, Occasion, Style } from "@/generated/prisma";

interface ProductSectionProps {
    control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
    watch: any;
    setValue: any;
    hsnCodes: Array<{ value: string; label: string }>;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
    control,
    watch,
    setValue,
    hsnCodes
}) => {
    const productName = watch('name');
    const materials = watch('materials') || [];

    useEffect(() => {
        if (productName && materials.length > 0) {
            const totalWeight: number = (materials as Array<{ weight: number }>).reduce(
                (sum: number, m: { weight: number }) => sum + m.weight,
                0
            );
            const sku = generateSKU(productName, totalWeight);
            setValue('sku', sku);
        }
    }, [productName, materials, setValue]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Product Information</CardTitle>
                    <FormField
                        control={control}
                        name="isRawMaterial"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel className="text-sm font-medium">Raw Material</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Name and SKU Row (60/40) */}
                <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-6">
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex- Mangalsutra 12g" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-4">
                        <FormField
                            control={control}
                            name="sku"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SKU (Auto-generated)</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-muted" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* HUID and HSN Code Row (30/30) */}
                <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="huid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HUID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter HUID" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="hsnCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HSN Code</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select HSN Code"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {hsnCodes.map((code) => (
                                                <SelectItem key={code.value} value={code.value}>
                                                    {code.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-4 row-span-2">
                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Enter description" 
                                            {...field} 
                                            className="h-[120px] resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="categoryId"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <CategorySelector
                                                    value={field.value || null}
                                                    onChange={field.onChange}
                                                    required={true}
                                                    showBadge={false}
                                                    className={`flex-1 ${fieldState.error ? 'border-red-500' : ''}`}
                                                />
                                                {fieldState.error && (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">{fieldState.error.message}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="brandId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand</FormLabel>
                                    <FormControl>
                                        <BrandSelector
                                            value={field.value || null}
                                            onChange={field.onChange}
                                            showBadge={false}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Attributes Row - Occasion, Gender, Style */}
                <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-3">
                        <FormField
                        control={control}
                        name="occasion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Occasion</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Occasion"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(Occasion).map((occasion) => (
                                            <SelectItem key={occasion} value={occasion}>
                                                {occasion.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(Gender).map((gender) => (
                                                <SelectItem key={gender} value={gender}>
                                                    {gender.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="style"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Style</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(Style).map((style) => (
                                                <SelectItem key={style} value={style}>
                                                    {style.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
4. PricingSections => import React from 'react';
import { Control } from 'react-hook-form';
import { CreateInventoryItemData } from '@/lib/types/inventory/inventory';
import { ChargeType, InventoryLocation } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateBuyingCost, calculateBuyingCostBreakdown, paiseToRupees, roundToTwoDecimals, formatPriceRupees } from '@/lib/utils/inventory/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Info } from 'lucide-react';

interface PricingSectionProps {
  control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
  watch: any;
  setValue: any;
  getValues: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  control,
  watch,
  setValue,
  getValues
}) => {
  const materials = watch('materials') || [];
  const gemstones = watch('gemstones') || [];

  // State for real-time updates
  const [buyingCostBreakdown, setBuyingCostBreakdown] = React.useState<any>(null);
  const [grossWeightBreakdown, setGrossWeightBreakdown] = React.useState<any>(null);

  // Real-time update function for buying cost breakdown
  const updateBuyingCostBreakdown = React.useCallback(() => {
    const validMaterials = materials.filter((m: any) => m && m.materialId && (m.weight || 0) > 0 && (m.buyingPrice || 0) > 0);
    const validGemstones = gemstones.filter((g: any) => g && g.gemstoneId && (g.weight || 0) > 0 && (g.buyingPrice || 0) > 0);

    if (validMaterials.length === 0 && validGemstones.length === 0) {
      setBuyingCostBreakdown(null);
      return;
    }

    const materialsBreakdown = validMaterials.map((m: any) => {
      const weight = parseFloat(m.weight) || 0;
      const price = parseFloat(m.buyingPrice) || 0;
      const total = roundToTwoDecimals(weight * price);
      return {
        id: m.materialId,
        weight,
        price,
        total
      };
    });

    const gemstonesBreakdown = validGemstones.map((g: any) => {
      const weight = parseFloat(g.weight) || 0;
      const price = parseFloat(g.buyingPrice) || 0;
      const total = roundToTwoDecimals(weight * price);
      return {
        id: g.gemstoneId,
        weight,
        price,
        total
      };
    });

    const materialsTotal = materialsBreakdown.reduce((sum: number, m: any) => sum + (m.total || 0), 0);
    const gemstonesTotal = gemstonesBreakdown.reduce((sum: number, g: any) => sum + (g.total || 0), 0);
    const total = roundToTwoDecimals(materialsTotal + gemstonesTotal);

    setBuyingCostBreakdown({
      materials: materialsBreakdown,
      gemstones: gemstonesBreakdown,
      materialsTotal,
      gemstonesTotal,
      total
    });
  }, [materials, gemstones]);

  // Real-time update function for gross weight breakdown
  const updateGrossWeightBreakdown = React.useCallback(() => {
    const validMaterials = materials.filter((m: any) => m.materialId && m.weight > 0);
    const validGemstones = gemstones.filter((g: any) => g.gemstoneId && g.weight > 0);

    if (validMaterials.length === 0 && validGemstones.length === 0) {
      setGrossWeightBreakdown(null);
      return;
    }

    const materialsWeight = validMaterials.reduce((sum: number, m: any) => sum + m.weight, 0);
    const gemstonesWeight = validGemstones.reduce((sum: number, g: any) => sum + g.weight, 0);
    const total = materialsWeight + gemstonesWeight;

    setGrossWeightBreakdown({
      materialsWeight,
      gemstonesWeight,
      total
    });
  }, [materials, gemstones]);

  // Update breakdowns when materials or gemstones change
  React.useEffect(() => {
    updateBuyingCostBreakdown();
    updateGrossWeightBreakdown();
  }, [
    materials, 
    gemstones, 
    JSON.stringify(materials.map((m: { weight: any; buyingPrice: any; }) => ({ weight: m.weight, buyingPrice: m.buyingPrice }))), 
    JSON.stringify(gemstones.map((g: { weight: any; buyingPrice: any; }) => ({ weight: g.weight, buyingPrice: g.buyingPrice }))),
    updateBuyingCostBreakdown, 
    updateGrossWeightBreakdown
  ]);

  React.useEffect(() => {
    // Auto-set buying cost but keep it editable
    if (buyingCostBreakdown && buyingCostBreakdown.total > 0) {
      const currentBuyingPrice = getValues('buyingPrice');
      if (!currentBuyingPrice || currentBuyingPrice === 0) {
        setValue('buyingPrice', buyingCostBreakdown.total);
      }
    }
  }, [buyingCostBreakdown, setValue, getValues]);

  React.useEffect(() => {
    // Auto-set gross weight
    if (grossWeightBreakdown && grossWeightBreakdown.total > 0) {
      setValue('grossWeight', grossWeightBreakdown.total);
    }
  }, [grossWeightBreakdown, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(InventoryLocation).map((location) => (
                      <SelectItem key={location} value={location}>
                        {location.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="wastage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wastage (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0.0"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="buyingPrice"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Buying Cost
                {buyingCostBreakdown && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="w-80">
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold mb-2">Buying Cost Breakdown:</div>
                        {buyingCostBreakdown.materials.map((material: any, index: number) => (
                          <div key={material.id || index} className="flex justify-between">
                            <span>Material {index + 1} ({material.weight}g × ₹{material.price}):</span>
                            <span>₹{material.total.toFixed(2)}</span>
                          </div>
                        ))}
                        {buyingCostBreakdown.gemstones.map((gemstone: any, index: number) => (
                          <div key={gemstone.id || index} className="flex justify-between">
                            <span>Gemstone {index + 1} ({gemstone.weight}g × ₹{gemstone.price}):</span>
                            <span>₹{isNaN(gemstone.total) ? '0.00' : gemstone.total.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Buying Cost:</span>
                            <span>₹{buyingCostBreakdown.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Auto-calculated based on buying prices, wastage, making charges and GST
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    className={`${fieldState.error ? 'border-red-500' : ''}`}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                  {fieldState.error && (
                      <Tooltip>
                          <TooltipTrigger>
                              <AlertCircle className="h-3 w-3 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                              <p className="text-xs">{fieldState.error.message}</p>
                          </TooltipContent>
                      </Tooltip>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                Enter the price at which you bought this item for profit calculations
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="makingChargeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Making Charge Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ChargeType.PERCENTAGE}>Percentage</SelectItem>
                    <SelectItem value={ChargeType.FIXED}>Fixed Amount</SelectItem>
                    <SelectItem value={ChargeType.PER_GRAM}>Per Gram</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="makingChargeValue"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Making Charge</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"

                      placeholder="0.00"
                      className={`${fieldState.error ? 'border-red-500' : ''}`}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    {fieldState.error && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">{fieldState.error.message}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
InventoryForm => import { useCreateInventoryItem, useInventoryItem, useUpdateInventoryItem } from "@/hooks/inventory/use-inventory";
import { toast } from "@/hooks/use-toast";
import { CreateInventoryItemData, createInventoryItemSchema, FormMode, updateInventoryItemSchema } from "@/lib/types/inventory/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChargeType } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ProductSection } from "./ProductSection";
import { MaterialsGemstonesSection } from "./MaterialsGemstonesSection";
import { Button } from "@/components/ui/button";
import { SummarySection } from "./SummarySection";
import { InventoryFormSkeleton } from "./InventoryFormSkeleton";
import { PricingSection } from "./PricingSection";

interface InventoryFormProps {
  mode: FormMode;
  onSuccess?: () => void;
}

const mockData = {
  hsnCodes: [
    { value: '7113', label: '7113 - Articles of jewellery' },
    { value: '7114', label: '7114 - Articles of goldsmiths' },
    { value: '7115', label: '7115 - Other articles of precious metal' },
  ],
};

export const InventoryForm: React.FC<InventoryFormProps> = ({ mode, onSuccess }) => {
    const isEdit = mode.mode === 'edit';
    const itemId = mode.itemId;

    const { data: existingItem, isLoading: isLoadingItem } = useInventoryItem(itemId || '');

    const createMutation = useCreateInventoryItem();
    const updateMutation = useUpdateInventoryItem();

    const defaultValues: Partial<CreateInventoryItemData> = {
        name: '',
        sku: '',
        description: '',
        hsnCode: '',
        huid: '',
        grossWeight: 0,
        wastage: 0,
        quantity: 1,
        location: undefined,
        sellingPrice: 0,
        buyingPrice: 0,
        isRawMaterial: false,
        gender: undefined,
        occasion: undefined,
        style: undefined,
        makingChargeType: ChargeType.PERCENTAGE,
        makingChargeValue: 0,
        categoryId: '',
        brandId: '',
        materials: [{ materialId: '', weight: 0, buyingPrice: 0 }],
        gemstones: [],
    };

    const form = useForm<CreateInventoryItemData | Partial<CreateInventoryItemData>>({
        resolver: zodResolver(isEdit ? updateInventoryItemSchema : createInventoryItemSchema),
        defaultValues,
        mode: 'onChange',
    })

    // Watch all form values for real-time updates
    const allFormValues = form.watch();

    // load existing data for edit mode
    React.useEffect(() => {
        if (isEdit && existingItem?.item) {
            const item = existingItem.item;
            form.reset({
                name: item.name,
                sku: item.sku,
                description: item.description || '',
                hsnCode: item.hsnCode || '',
                huid: item.huid || '',
                grossWeight: item.grossWeight,
                wastage: item.wastage || 0,
                quantity: item.quantity,
                location: item.location || undefined,
                sellingPrice: item.sellingPrice,
                buyingPrice: item.buyingPrice || 0,
                isRawMaterial: item.isRawMaterial,
                gender: item.gender || undefined,
                occasion: item.occasion || undefined,
                style: item.style || undefined,
                makingChargeType: item.makingChargeType,
                makingChargeValue: item.makingChargeValue,
                categoryId: item.category.id,
                brandId: item.brand?.id || '',
                materials: item.materials.map(m => ({
                    materialId: m.material.id,
                    weight: m.weight / 1000, // Convert from mg to grams for form display
                    buyingPrice: m.buyingPrice / 100, // Convert from paise to rupees for form display
                })),
                gemstones: item.gemstones?.map(g => ({
                    gemstoneId: g.gemstone.id,
                    weight: g.weight / 1000, // Convert from mg to grams for form display
                    buyingPrice: g.buyingPrice / 100, // Convert from paise to rupees for form display
                })) || [],
            });
        }
    }, [isEdit, existingItem, form]);

    const onSubmit = async (data: CreateInventoryItemData | Partial<CreateInventoryItemData>) => {
        try {
            // Validate that at least one material exists and has required fields
            const materials = data.materials || [];
            if (materials.length === 0) {
                toast({
                    title: "Validation Error",
                    description: "At least one material is required",
                    variant: 'destructive'
                });
                return;
            }

            // Check if all materials have weight and buying price
            const invalidMaterials = materials.some((material, index) =>
                !material.materialId || material.weight <= 0 || material.buyingPrice <= 0
            );

            if (invalidMaterials) {
                toast({
                    title: "Validation Error",
                    description: "All materials must have valid weight and buying price",
                    variant: 'destructive'
                });
                return;
            }

            // Check if all gemstones have weight and buying price (if any gemstones exist)
            const gemstones = data.gemstones || [];
            const invalidGemstones = gemstones.some((gemstone, index) =>
                !gemstone.gemstoneId || gemstone.weight <= 0 || gemstone.buyingPrice <= 0
            );

            if (invalidGemstones) {
                toast({
                    title: "Validation Error",
                    description: "All gemstones must have valid weight and buying price",
                    variant: 'destructive'
                });
                return;
            }

            // Convert form data to API format (grams to mg, rupees to paise)
            const apiData = {
                ...data,
                materials: materials.map(m => ({
                    materialId: m.materialId,
                    weight: Math.round(m.weight * 1000), // grams to mg
                    buyingPrice: Math.round(m.buyingPrice * 100), // rupees to paise
                })),
                gemstones: gemstones.map(g => ({
                    gemstoneId: g.gemstoneId,
                    weight: Math.round(g.weight * 1000), // grams to mg
                    buyingPrice: Math.round(g.buyingPrice * 100), // rupees to paise
                })),
                buyingPrice: Math.round((data.buyingPrice || 0) * 100), // rupees to paise
                sellingPrice: Math.round((data.sellingPrice || 0) * 100), // rupees to paise
                grossWeight: Math.round((data.grossWeight || 0) * 1000), // grams to mg
            };

            if (isEdit && itemId) {
                await updateMutation.mutateAsync({id: itemId, data: apiData });
                toast({
                    title: "Success",
                    description: "Inventory item updated successfully",
                });
            } else {
                await createMutation.mutateAsync(apiData as CreateInventoryItemData);
                toast({
                    title: "Success",
                    description: "Inventory item created successfully",
                });
            }
            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error Saving Product",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                variant: 'destructive'
            });
        }
    };

    const onSaveAndAddAnother = async (data: CreateInventoryItemData | Partial<CreateInventoryItemData>) => {
        try {
            // Same validation as onSubmit
            const materials = data.materials || [];
            if (materials.length === 0) {
                toast({
                    title: "Validation Error",
                    description: "At least one material is required",
                    variant: 'destructive'
                });
                return;
            }

            const invalidMaterials = materials.some((material, index) =>
                !material.materialId || material.weight <= 0 || material.buyingPrice <= 0
            );

            if (invalidMaterials) {
                toast({
                    title: "Validation Error",
                    description: "All materials must have valid weight and buying price",
                    variant: 'destructive'
                });
                return;
            }

            const gemstones = data.gemstones || [];
            const invalidGemstones = gemstones.some((gemstone, index) =>
                !gemstone.gemstoneId || gemstone.weight <= 0 || gemstone.buyingPrice <= 0
            );

            if (invalidGemstones) {
                toast({
                    title: "Validation Error",
                    description: "All gemstones must have valid weight and buying price",
                    variant: 'destructive'
                });
                return;
            }

            if (!isEdit) {
                // Convert form data to API format (grams to mg, rupees to paise)
                const apiData = {
                    ...data,
                    materials: materials.map(m => ({
                        materialId: m.materialId,
                        weight: Math.round(m.weight * 1000), // grams to mg
                        buyingPrice: Math.round(m.buyingPrice * 100), // rupees to paise
                    })),
                    gemstones: gemstones.map(g => ({
                        gemstoneId: g.gemstoneId,
                        weight: Math.round(g.weight * 1000), // grams to mg
                        buyingPrice: Math.round(g.buyingPrice * 100), // rupees to paise
                    })),
                    buyingPrice: Math.round((data.buyingPrice || 0) * 100), // rupees to paise
                    sellingPrice: Math.round((data.sellingPrice || 0) * 100), // rupees to paise
                    grossWeight: Math.round((data.grossWeight || 0) * 1000), // grams to mg
                };

                await createMutation.mutateAsync(apiData as CreateInventoryItemData);
                form.reset(defaultValues);
                toast({
                    title: "Success",
                    description: "Item saved! Ready to add another.",
                });
            }
        } catch (error) {
            toast({
                title: "Save and add another error",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                variant: 'destructive'
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (isEdit && isLoadingItem) {
        return <InventoryFormSkeleton />;
    }

    if (!form) {
        return <InventoryFormSkeleton />;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Inventory Item' : "Add New Inventory Item"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? 'Update inventory item details' : 'Create a new inventory item for your jewelry shop'}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - 2/3 width */}
                        <div className="lg:col-span-2 space-y-6">
                            <ProductSection
                                control={form.control}
                                watch={form.watch}
                                setValue={form.setValue}
                                hsnCodes={mockData.hsnCodes}
                            />
                            
                            <MaterialsGemstonesSection
                                control={form.control}
                                setValue={form.setValue}
                                watch={form.watch}
                            />

                            <div className="flex gap-4 justify-end">
                                {!isEdit && (
                                    <Button
                                        type="button"
                                        variant='outline'
                                        onClick={form.handleSubmit(onSaveAndAddAnother)}
                                        disabled={isLoading}
                                        className="cursor-pointer"
                                    >
                                        Save & Add Another
                                    </Button>
                                )}
                                <Button type="submit" disabled={isLoading} className="cursor-pointer">
                                    {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Item' : 'Save Item')}
                                </Button>
                            </div>
                        </div>

                        {/* Right Column - 1/3 width */}
                        <div className="space-y-6">
                            <PricingSection
                                control={form.control}
                                watch={form.watch}
                                setValue={form.setValue}
                                getValues={form.getValues}
                            />

                            <SummarySection
                                control={form.control}
                                watch={form.watch}
                                setValue={form.setValue}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
/api/v1/inventory/id => 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { updateInventoryItemSchema } from '@/lib/types/inventory/inventory';
import { z } from 'zod';
import { requirePermission } from '@/lib/utils/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('VIEW_INVENTORY');
    const { id } = await params;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
        materials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                type: true,
                purity: true,
                defaultRate: true,
                unit: true,
              },
            },
          },
        },
        gemstones: {
          include: {
            gemstone: {
              select: {
                id: true,
                name: true,
                shape: true,
                clarity: true,
                color: true,
                defaultRate: true,
                unit: true,
              },
            },
          },
        },
        stockAdjustments: {
          include: {
            adjustedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 adjustments
        },
        saleItems: {
          include: {
            sale: {
              select: {
                id: true,
                billNumber: true,
                saleDate: true,
                totalAmount: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('EDIT_INVENTORY');
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateInventoryItemSchema.parse(body);
    
    // Check if item exists and belongs to user's shop
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        materials: true,
        gemstones: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if SKU is being updated and if it conflicts
    if (validatedData.sku && validatedData.sku !== existingItem.sku) {
      const skuExists = await prisma.inventoryItem.findFirst({
        where: {
          sku: validatedData.sku,
          shopId: session.user.shopId,
          id: { not: id },
        },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Validate category if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          shopId: session.user.shopId,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Validate brand if provided
    if (validatedData.brandId) {
      const brand = await prisma.brand.findFirst({
        where: {
          id: validatedData.brandId,
          shopId: session.user.shopId,
        },
      });

      if (!brand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        );
      }
    }

    // Validate supplier if provided
    if (validatedData.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: validatedData.supplierId,
          shopId: session.user.shopId,
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data - handle enum values properly for Prisma
    const updateData: any = {};
    
    // Only include fields that are provided in the request
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.hsnCode !== undefined) updateData.hsnCode = validatedData.hsnCode;
    if (validatedData.huid !== undefined) updateData.huid = validatedData.huid;
    if (validatedData.grossWeight !== undefined) updateData.grossWeight = validatedData.grossWeight;
    if (validatedData.wastage !== undefined) updateData.wastage = validatedData.wastage;
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.sellingPrice !== undefined) updateData.sellingPrice = validatedData.sellingPrice;
    if (validatedData.buyingPrice !== undefined) updateData.buyingPrice = validatedData.buyingPrice;
    if (validatedData.isRawMaterial !== undefined) updateData.isRawMaterial = validatedData.isRawMaterial;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.gender !== undefined) updateData.gender = validatedData.gender;
    if (validatedData.occasion !== undefined) updateData.occasion = validatedData.occasion;
    if (validatedData.style !== undefined) updateData.style = validatedData.style;
    if (validatedData.makingChargeType !== undefined) updateData.makingChargeType = validatedData.makingChargeType;
    if (validatedData.makingChargeValue !== undefined) updateData.makingChargeValue = validatedData.makingChargeValue;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId;
    if (validatedData.brandId !== undefined) updateData.brandId = validatedData.brandId;
    if (validatedData.supplierId !== undefined) updateData.supplierId = validatedData.supplierId;
    
    // Always update the updatedById
    updateData.updatedById = session.user.id;

    // Handle materials update if provided
    if (validatedData.materials) {
      // Validate materials exist and belong to shop
      const materialIds = validatedData.materials.map(m => m.materialId);
      const materials = await prisma.material.findMany({
        where: {
          id: { in: materialIds },
          shopId: session.user.shopId,
        },
      });

      if (materials.length !== materialIds.length) {
        return NextResponse.json(
          { error: 'One or more materials not found' },
          { status: 404 }
        );
      }

      updateData.materials = {
        deleteMany: {}, // Delete existing materials
        create: validatedData.materials.map(material => ({
          materialId: material.materialId,
          weight: material.weight,
          buyingPrice: material.buyingPrice,
        })),
      };
    }

    // Handle gemstones update if provided
    if (validatedData.gemstones) {
      if (validatedData.gemstones.length > 0) {
        // Validate gemstones exist and belong to shop
        const gemstoneIds = validatedData.gemstones.map(g => g.gemstoneId);
        const gemstones = await prisma.gemstone.findMany({
          where: {
            id: { in: gemstoneIds },
            shopId: session.user.shopId,
          },
        });

        if (gemstones.length !== gemstoneIds.length) {
          return NextResponse.json(
            { error: 'One or more gemstones not found' },
            { status: 404 }
          );
        }

        updateData.gemstones = {
          deleteMany: {}, // Delete existing gemstones
          create: validatedData.gemstones.map(gemstone => ({
            gemstoneId: gemstone.gemstoneId,
            weight: gemstone.weight,
            buyingPrice: gemstone.buyingPrice,
          })),
        };
      } else {
        updateData.gemstones = {
          deleteMany: {}, // Delete all existing gemstones
        };
      }
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
        materials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                type: true,
                purity: true,
                defaultRate: true,
                unit: true,
              },
            },
          },
        },
        gemstones: {
          include: {
            gemstone: {
              select: {
                id: true,
                name: true,
                shape: true,
                clarity: true,
                color: true,
                defaultRate: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('DELETE_INVENTORY');
    const { id } = await params;

    // Check if item exists and belongs to user's shop
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        saleItems: true,
        stockAdjustments: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if item has been sold
    if (item.saleItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item that has been sold' },
        { status: 400 }
      );
    }

    // Check if item has stock adjustments
    if (item.stockAdjustments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item with stock adjustment history' },
        { status: 400 }
      );
    }

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/utils/auth-utils";
import { createInventoryItemSchema } from "@/lib/types/inventory/inventory";
import { z }from 'zod';

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_INVENTORY');
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId') || '';
        const brandId = searchParams.get('brandId') || '';
        const supplierId = searchParams.get('supplierId') || '';
        const status = searchParams.get('status') || '';
        const isRawMaterial = searchParams.get('isRawMaterial');
        const minWeight = searchParams.get('minWeight');
        const maxWeight = searchParams.get('maxWeight');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        const skip = (page - 1) * limit;

        const where: any = {
            shopId: session.user.shopId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { huid: { contains: search, mode: 'insensitive' } },
            ];
        }

        // filters
        if (categoryId) where.categoryId = categoryId;
        if (brandId) where.brandId = brandId;
        if (supplierId) where.supplierId = supplierId;
        if (status) where.status = status;
        if (isRawMaterial !== null) where.isRawMaterial = isRawMaterial === 'true';

        // Weight range
        if (minWeight || maxWeight) {
            where.grossWeight = {};
            if (minWeight) where.grossWeight.gte = parseFloat(minWeight);
            if (maxWeight) where.grossWeight.lte = parseFloat(maxWeight);
        }
        
        // Price range
        if (minPrice || maxPrice) {
            where.sellingPrice = {};
            if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
            if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
        }

        const [items, total] = await Promise.all([
            prisma.inventoryItem.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    brand: { select: { id: true, name: true } },
                    supplier: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                    updatedBy: { select: { id: true, name: true } },
                    materials: {
                        include: {
                            material: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true,
                                    purity: true,
                                    defaultRate: true,
                                    unit: true,
                                },
                            },
                        },
                    },
                    gemstones: {
                        include: {
                            gemstone: {
                                select: {
                                    id: true,
                                    name: true,
                                    shape: true,
                                    clarity: true,
                                    color: true,
                                    defaultRate: true,
                                    unit: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.inventoryItem.count({ where }),
        ]);

        return NextResponse.json({
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error fetching inventory items: ', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventory items' },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('CREATE_INVENTORY');
        const body = await request.json();

        const validatedData = createInventoryItemSchema.parse(body);

        // check if sku already exists for this shop
        const existingSku = await prisma.inventoryItem.findFirst({
            where: {
                sku: validatedData.sku,
                shopId: session.user.shopId,
            },
        });

        if (existingSku) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 409 }
            );
        }

        // Check if category exists and belongs to shop
        const category = await prisma.category.findFirst({
            where: {
                id: validatedData.categoryId,
                shopId: session.user.shopId,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        if (validatedData.brandId) {
            const brand = await prisma.brand.findFirst({
                where: {
                    id: validatedData.brandId,
                    shopId: session.user.shopId,
                },
            });

            if (!brand) {
                return NextResponse.json(
                    { error: 'Brand not found' },
                    { status: 404 }
                );
            }
        }

        if (validatedData.supplierId) {
            const supplier = await prisma.supplier.findFirst({
                where: {
                    id: validatedData.supplierId,
                    shopId: session.user.shopId,
                },
            });

            if (!supplier) {
                return NextResponse.json(
                    { error: 'Supplier not found' },
                    { status: 404 }
                );
            }
        }

        const materialIds = validatedData.materials.map(m => m.materialId);
        const materials = await prisma.material.findMany({
            where: {
                id: { in: materialIds },
                shopId: session.user.shopId,
            },
        });

        if (materials.length !== materialIds.length) {
            return NextResponse.json(
                { error: 'One or more materials not found' },
                { status: 404 }
            );
        }

        if (validatedData.gemstones && validatedData.gemstones.length > 0) {
            const gemstoneIds = validatedData.gemstones.map(g => g.gemstoneId);
            const gemstones = await prisma.gemstone.findMany({
                where: {
                    id: { in: gemstoneIds },
                    shopId: session.user.shopId,
                },
            });

            if (gemstones.length !== gemstoneIds.length) {
                return NextResponse.json(
                    { error: 'One or more gemstones not found' },
                    { status: 404 }
                );
            }
        }

        const item = await prisma.inventoryItem.create({
            data: {
                name: validatedData.name,
                sku: validatedData.sku,
                description: validatedData.description,
                hsnCode: validatedData.hsnCode,
                huid: validatedData.huid,
                grossWeight: validatedData.grossWeight,
                wastage: validatedData.wastage,
                quantity: validatedData.quantity,
                location: validatedData.location,
                sellingPrice: validatedData.sellingPrice,
                buyingPrice: validatedData.buyingPrice,
                isRawMaterial: validatedData.isRawMaterial,
                status: validatedData.status,
                gender: validatedData.gender,
                occasion: validatedData.occasion,
                style: validatedData.style,
                makingChargeType: validatedData.makingChargeType,
                makingChargeValue: validatedData.makingChargeValue,
                shopId: session.user.shopId,
                categoryId: validatedData.categoryId,
                brandId: validatedData.brandId,
                supplierId: validatedData.supplierId,
                createdById: session.user.id,
                updatedById: session.user.id,
                materials: {
                    create: validatedData.materials.map(material => ({
                        materialId: material.materialId,
                        weight: material.weight,
                        buyingPrice: material.buyingPrice,
                    })),
                },
                ...(validatedData.gemstones && {
                    gemstones: {
                        create: validatedData.gemstones.map(gemstone => ({
                            gemstoneId: gemstone.gemstoneId,
                            weight: gemstone.weight,
                            buyingPrice: gemstone.buyingPrice,
                        })),
                    },
                }),
            },
            include: {
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                supplier: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
                updatedBy: { select: { id: true, name: true } },
                materials: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                purity: true,
                                defaultRate: true,
                                unit: true,
                            },
                        },
                    },
                },
                gemstones: {
                    include: {
                        gemstone: {
                            select: {
                                id: true,
                                name: true,
                                shape: true,
                                clarity: true,
                                color: true,
                                defaultRate: true,
                                unit: true,
                            },
                        },
                    },
                },
            }
        });

        return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
        console.error('Error creating inventory item:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create inventory item' },
            { status: 500 }
        );
    }
}