// lib/types/settings.ts
export interface Shop {
  id: string;
  name: string;
  address: string | null;
  gstin: string | null;
  contactNumber: string | null;
  email: string | null;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  id: string;
  defaultMakingChargeType: 'PERCENTAGE' | 'FIXED';
  defaultMakingChargeValue: number;
  gstGoldRate: number;
  gstMakingRate: number;
  primaryLanguage: string;
  billingPrefix: string;
  nextBillNumber: number;
  invoiceTemplateId: string | null;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string | null;
  previewUrl: string;
  templateType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateShopRequest {
  name?: string;
  address?: string;
  gstin?: string;
  contactNumber?: string;
  email?: string;
  logoUrl?: string;
}

export interface UpdateShopSettingsRequest {
  defaultMakingChargeType?: 'PERCENTAGE' | 'FIXED';
  defaultMakingChargeValue?: number;
  gstGoldRate?: number;
  gstMakingRate?: number;
  primaryLanguage?: string;
  billingPrefix?: string;
  invoiceTemplateId?: string;
}

export interface ShopWithSettings extends Shop {
  settings: ShopSettings | null;
}

export interface InvoiceTemplatesResponse {
  templates: InvoiceTemplate[];
  total: number;
}