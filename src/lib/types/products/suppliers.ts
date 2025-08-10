import { z } from 'zod';

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
  gstin?: string;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  _count?: {
    inventory: number;
    purchases: number;
  };
}

export interface CreateSupplierData {
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
  gstin?: string;
}

export interface UpdateSupplierData {
  name?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  gstin?: string;
}

// Validation Schemas
export const createSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(100, "Name too long"),
  contactNumber: z.string().min(10, "Invalid contact number"),
  email: z.string().email("Invalid email").optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(100, "Name too long").optional(),
  contactNumber: z.string().min(10, "Invalid contact number").optional(),
  email: z.string().email("Invalid email").optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

// API Response Types
export interface SuppliersResponse {
  suppliers: Supplier[];
  total: number;
}

export interface SupplierResponse {
  supplier: Supplier;
}