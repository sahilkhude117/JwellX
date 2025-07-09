export interface OnboardingData {
  shopName: string;
  address: string;
  email: string;
  contactNumber: string;
  gstin?: string;
  logoUrl?: string;
  billingPrefix: string;
  invoiceTemplateId: string;
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

export interface OnboardingStatus {
  hasCompletedOnboarding: boolean;
}

export interface OnboardingResponse {
  message: string;
  shop: {
    id: string;
    name: string;
    address: string;
    email: string;
    contactNumber: string;
    gstin: string | null;
    logoUrl: string | null;
    settings: {
      billingPrefix: string;
      invoiceTemplateId: string;
    };
  };
}