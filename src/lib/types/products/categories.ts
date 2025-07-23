// src/types/categories.ts
import { z } from 'zod';

export type JewelryCategory =
  | "RING"
  | "CHAIN"
  | "NECKLACE"
  | "BANGLE"
  | "BRACELET"
  | "EARRING"
  | "PENDANT"
  | "OTHER";

export const JEWELRY_CATEGORIES: { value: JewelryCategory; label: string }[] = [
  { value: "RING", label: "Ring" },
  { value: "CHAIN", label: "Chain" },
  { value: "NECKLACE", label: "Necklace" },
  { value: "BANGLE", label: "Bangle" },
  { value: "BRACELET", label: "Bracelet" },
  { value: "EARRING", label: "Earring" },
  { value: "PENDANT", label: "Pendant" },
  { value: "OTHER", label: "Other" },
];

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  _count?: {
    products: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  _count?: {
    products: number;
  };
}

export interface CreateBrandData {
  name: string;
  description?: string;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
}

// Validation Schemas
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name too long"),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name too long").optional(),
  description: z.string().optional(),
});

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Name too long"),
  description: z.string().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Name too long").optional(),
  description: z.string().optional(),
});


// API Response Types
export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export interface BrandsResponse {
  brands: Brand[];
  total: number;
}

export interface CategoryResponse {
  category: Category;
}

export interface BrandResponse {
  brand: Brand;
}