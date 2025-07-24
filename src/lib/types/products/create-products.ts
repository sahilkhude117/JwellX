// src/lib/types/products/add-product.ts
import { z } from "zod";
import { MaterialType, GemstoneShape } from "./materials";

// Base validation schemas
export const productAttributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  value: z.string().min(1, "Attribute value is required"),
});

export const variantMaterialInputSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  purity: z.string().min(1, "Purity is required"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  rate: z.number().min(0, "Rate must be non-negative"),
});

export const variantGemstoneInputSchema = z.object({
  gemstoneId: z.string().min(1, "Gemstone is required"),
  caratWeight: z.number().min(0.01, "Carat weight must be greater than 0"),
  cut: z.string().optional(),
  color: z.string().optional(),
  clarity: z.string().optional(),
  certificationId: z.string().optional(),
  rate: z.number().min(0, "Rate must be non-negative"),
});

export const variantInputSchema = z.object({
  sku: z.string().min(1, "Variant SKU is required"),
  totalWeight: z.number().min(0.01, "Total weight must be greater than 0"),
  makingCharge: z.number().min(0, "Making charge must be non-negative"),
  wastage: z.number().min(0, "Wastage must be non-negative").optional(),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  materials: z.array(variantMaterialInputSchema).min(1, "At least one material is required"),
  gemstones: z.array(variantGemstoneInputSchema).default([]),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Name is too long"),
  sku: z.string().min(1, "Product SKU is required").max(100, "SKU is too long"),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
  attributes: z.array(productAttributeSchema).default([]),
  variants: z.array(variantInputSchema).min(1, "At least one variant is required"),
});

// Form types for UI components
export interface MaterialFormData {
  id: string;
  materialId: string;
  materialType: string;
  purity: string;
  weight: number;
  rate: number;
}

export interface GemstoneFormData {
  id: string;
  gemstoneId: string;
  gemstoneType: string;
  caratWeight: number;
  cut?: string;
  color?: string;
  clarity?: string;
  certificationId?: string;
  rate: number;
}

export interface VariantFormData {
  id: string;
  sku: string;
  totalWeight: number;
  makingCharge: number;
  wastage?: number;
  quantity: number;
  materials: MaterialFormData[];
  gemstones: GemstoneFormData[];
}

export interface ProductAttributeFormData {
  id: string;
  name: string;
  value: string;
}

export interface CreateProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  hsnCode: string;
  imageUrls: string[];
  attributes: ProductAttributeFormData[];
  variants: VariantFormData[];
}

// API types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductAttributeInput = z.infer<typeof productAttributeSchema>;
export type VariantInput = z.infer<typeof variantInputSchema>;
export type VariantMaterialInput = z.infer<typeof variantMaterialInputSchema>;
export type VariantGemstoneInput = z.infer<typeof variantGemstoneInputSchema>;

// Response types
export interface CreateProductResponse {
  id: string;
  name: string;
  sku: string;
  message: string;
}

// Lookup data types for dropdowns
export interface MaterialOption {
  id: string;
  name: string;
  type: MaterialType;
  purity: string;
  defaultRate: number;
  unit: string;
}

export interface GemstoneOption {
  id: string;
  name: string;
  shape: GemstoneShape;
  size: string;
  clarity?: string;
  color?: string;
  defaultRate: number;
  unit: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  description?: string;
}

export interface BrandOption {
  id: string;
  name: string;
  description?: string;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface CreateProductError {
  message: string;
  validationErrors?: ValidationError[];
}