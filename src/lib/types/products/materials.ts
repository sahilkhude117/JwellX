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
  size: string;
  clarity: string | null;
  color: string | null;
  defaultRate: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  _count?: {
    variantGemstones: number;
  };
}

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

export interface CreateGemstoneData {
  name: string;
  shape: GemstoneShape;
  size: string;
  clarity?: string;
  color?: string;
  unit?: string;
}

export interface UpdateGemstoneData {
  name?: string;
  shape?: GemstoneShape;
  size?: string;
  clarity?: string;
  color?: string;
  unit?: string;
}

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