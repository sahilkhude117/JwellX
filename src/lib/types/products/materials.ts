import { z } from "zod";

// src/types/materials-gemstones.ts
export enum MaterialType {
  GOLD = "GOLD",
  SILVER = "SILVER",
  PLATINUM = "PLATINUM",
  PALLADIUM = "PALLADIUM",
  OTHER = "OTHER"
}

export enum GemstoneShape {
  ROUND = "ROUND",
  OVAL = "OVAL",
  PEAR = "PEAR",
  EMERALD = "EMERALD",
  PRINCESS = "PRINCESS",
  MARQUISE = "MARQUISE",
  OTHER = "OTHER"
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  purity: string;
  defaultRate: number;
  unit: string;
  created: string;
  updatedAt: string;
  shopId: string;
  _count?: {
    variantMaterials: number;
  };
}

export interface Gemstone {
  id: string;
  name: string;
  shape: GemstoneShape;
  clarity: string;
  color: string;
  defaultRate: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  _count?: {
    variantGemstones: number;
  };
}

export const materialSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(Object.values(MaterialType) as [MaterialType, ...MaterialType[]]),
  purity: z.string(),
  defaultRate: z.number().min(0),
  unit: z.string(),
})

export interface CreateMaterialData {
  name: string;
  type: MaterialType;
  purity: string;
  unit?: string;
}

export interface UpdateMaterialData {
  name?: string;
  type?: MaterialType;
  purity?: string;
  unit?: string;
}

export const variantMaterialSchema = z.object({
  materialId: z.string(),
  purity: z.string(),
  weight: z.number().min(0),
  rate: z.number().min(0),
})

export const gemstoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  shape: z.enum(Object.values(GemstoneShape) as [GemstoneShape, ...GemstoneShape[]]),
  clarity: z.string(),
  color: z.string(),
  defaultRate: z.number().min(0),
  unit: z.string(),
});

export interface CreateGemstoneData {
  name: string;
  shape: GemstoneShape;
  clarity: string;
  color: string;
  unit?: string;
}

export interface UpdateGemstoneData {
  name?: string;
  shape?: GemstoneShape;
  clarity?: string;
  color?: string;
  unit?: string;
}

export const variantGemstoneSchema = z.object({
  gemstoneId: z.string(),
  caratWeight: z.number().min(0),
  cut: z.string().optional(),
  color: z.string().optional(),
  clarity: z.string().optional(),
  certificationId: z.string().optional(),
  rate: z.number().min(0),
});

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}