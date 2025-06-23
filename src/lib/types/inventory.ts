
export type Supplier = {
  id: string;
  name: string;
};

export type PurchaseLogItem = {
  productVariantId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
};

export type PurchaseLogRowData = {
  id: string;
  purchaseDate: string;
  supplier: Supplier;
  referenceNumber?: string;
  totalItems: number;
  totalCost: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
};

export type AdjustmentType = 
  | 'CORRECTION'
  | 'DAMAGE'
  | "THEFT_LOSS"
  | 'RETURN_TO_SUPPLIER'
  | 'MARKETING_SAMPLE';

export type StockAdjustmentLogItem = {
  id: string;
  timestamp: string; // ISO Date String of the event
  productVariant: {
    id: string;
    sku: string;
    name: string; // e.g., "Elegant Gold Ring (22K, 5.2g)"
  };
  user: {
    id: string;
    name: string; // The user who made the adjustment
  };
  adjustmentType: AdjustmentType;
  quantityBefore: number;
  quantityAfter: number;
  change: number; // e.g., -1, +5
  notes?: string; // The mandatory reason for the change
};