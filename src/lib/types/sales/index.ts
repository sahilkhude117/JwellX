import { 
  Sale, 
  SaleItem, 
  Customer,
  InventoryItem,
  Material,
  Gemstone,
  User,
  PaymentStatus,
  PaymentMethod,
  DiscountType,
  ChargeType,
  MaterialType,
  GemstoneShape
} from "@/generated/prisma";

// Enums that will be added to the schema
export enum SaleStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED', 
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum ReturnType {
  FULL_RETURN = 'FULL_RETURN',
  PARTIAL_RETURN = 'PARTIAL_RETURN',
  EXCHANGE = 'EXCHANGE',
  DEFECTIVE = 'DEFECTIVE'
}

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum ItemCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  DAMAGED = 'DAMAGED'
}

export enum PosSessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  RECONCILED = 'RECONCILED'
}

// Base Sales Types - using current Sale/SaleItem structure
export type BaseSale = Sale;
export type BaseSaleItem = SaleItem;

// New model types that will be created
export interface SalePayment {
  id: string;
  saleId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: Date;
  cardNumber?: string | null;
  upiTransactionId?: string | null;
  chequeNumber?: string | null;
  bankReference?: string | null;
  status: PaymentStatus;
  processedAt?: Date | null;
  shopId: string;
  userId: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleReturn {
  id: string;
  originalSaleId: string;
  returnDate: Date;
  returnType: ReturnType;
  reason: string;
  returnAmount: number;
  refundAmount: number;
  restockingFee: number;
  shopId: string;
  userId: string;
  status: ReturnStatus;
  approvedById?: string | null;
  approvedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleReturnItem {
  id: string;
  saleReturnId: string;
  saleItemId: string;
  returnQuantity: number;
  returnAmount: number;
  condition: ItemCondition;
  restockable: boolean;
  createdAt: Date;
}

export interface SaleItemMaterial {
  id: string;
  saleItemId: string;
  materialId: string;
  materialName: string;
  materialType: MaterialType;
  purity: string;
  weight: number;
  ratePerGram: number;
  totalValue: number;
  gstRate: number;
  gstAmount: number;
  createdAt: Date;
}

export interface SaleItemGemstone {
  id: string;
  saleItemId: string;
  gemstoneId: string;
  gemstoneName: string;
  shape: GemstoneShape;
  clarity: string;
  color: string;
  weight: number;
  ratePerCarat: number;
  totalValue: number;
  gstRate: number;
  gstAmount: number;
  createdAt: Date;
}

export interface PosSession {
  id: string;
  sessionNumber: string;
  startTime: Date;
  endTime?: Date | null;
  openingCash: number;
  closingCash?: number | null;
  expectedCash?: number | null;
  variance?: number | null;
  status: PosSessionStatus;
  totalSales: number;
  totalCashSales: number;
  totalCardSales: number;
  totalUpiSales: number;
  totalTransactions: number;
  shopId: string;
  openedById: string;
  closedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySalesSummary {
  id: string;
  date: Date;
  shopId: string;
  totalSales: number;
  totalAmount: number;
  totalDiscount: number;
  totalGst: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  otherSales: number;
  goldWeight: number;
  goldValue: number;
  silverWeight: number;
  silverValue: number;
  topCategoryId?: string | null;
  topBrandId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Sale with relations (updated for current schema)
export interface SaleWithDetails extends BaseSale {
  customer?: Customer | null;
  items: SaleItemWithDetails[];
  payments?: SalePayment[];
  returns?: SaleReturnWithDetails[];
  createdBy: Pick<User, 'id' | 'name' | 'role'>;
  posSession?: Pick<PosSession, 'id' | 'sessionNumber'> | null;
}

// Enhanced SaleItem with full breakdown (updated for current schema)
export interface SaleItemWithDetails extends BaseSaleItem {
  item: InventoryItemForSale;
  materialBreakdown?: SaleItemMaterial[];
  gemstoneBreakdown?: SaleItemGemstone[];
  returnItems?: SaleReturnItem[];
}

// Material breakdown with details
export interface SaleItemMaterialWithDetails extends SaleItemMaterial {
  material: Pick<Material, 'id' | 'name' | 'type' | 'purity' | 'unit'>;
}

// Gemstone breakdown with details
export interface SaleItemGemstoneWithDetails extends SaleItemGemstone {
  gemstone: Pick<Gemstone, 'id' | 'name' | 'shape' | 'clarity' | 'color' | 'unit'>;
}

// Payment with details
export interface SalePaymentWithDetails extends SalePayment {
  processedBy: Pick<User, 'id' | 'name'>;
}

// Return with details
export interface SaleReturnWithDetails extends SaleReturn {
  items: SaleReturnItemWithDetails[];
  processedBy: Pick<User, 'id' | 'name'>;
  approvedBy?: Pick<User, 'id' | 'name'> | null;
}

// Return item with details
export interface SaleReturnItemWithDetails extends SaleReturnItem {
  originalSaleItem: Pick<SaleItem, 'id' | 'itemId' | 'totalAmount'>;
}

// Inventory item for sales
export interface InventoryItemForSale {
  id: string;
  name: string;
  sku: string;
  huid?: string | null;
  grossWeight: number;
  makingChargeType: ChargeType;
  makingChargeValue: number;
  sellingPrice: number;
  quantity: number;
  materials: {
    material: Pick<Material, 'id' | 'name' | 'type' | 'purity' | 'defaultRate' | 'unit'>;
    weight: number;
  }[];
  gemstones: {
    gemstone: Pick<Gemstone, 'id' | 'name' | 'shape' | 'clarity' | 'color' | 'defaultRate' | 'unit'>;
    weight: number;
  }[];
  category: { id: string; name: string };
  brand?: { id: string; name: string } | null;
}

// POS Session with details
export interface PosSessionWithDetails extends PosSession {
  openedBy: Pick<User, 'id' | 'name'>;
  closedBy?: Pick<User, 'id' | 'name'> | null;
  sales: Pick<Sale, 'id' | 'billNumber' | 'totalAmount' | 'paymentStatus'>[];
}

// Daily Sales Summary with details
export interface DailySalesSummaryWithDetails extends DailySalesSummary {
  shop: { id: string; name: string };
}

// API Request/Response Types

// Create Sale Request
export interface CreateSaleData {
  customerId?: string;
  items: CreateSaleItemData[];
  saleLevelDiscount?: number;
  saleLevelDiscountType?: DiscountType;
  payments?: CreateSalePaymentData[];
  notes?: string;
}

// Create Sale Item Request
export interface CreateSaleItemData {
  itemId: string;
  quantity: number;
  materialBreakdown: CreateSaleItemMaterialData[];
  gemstoneBreakdown: CreateSaleItemGemstoneData[];
  makingChargeType: ChargeType;
  makingChargeRate: number;
  grossWeight: number;
  wastagePercentage?: number;
  discountType?: DiscountType;
  discountValue?: number;
  customization?: string;
  notes?: string;
}

// Material breakdown for sale item
export interface CreateSaleItemMaterialData {
  materialId: string;
  weight: number;
  ratePerGram: number;
  gstRate: number;
}

// Gemstone breakdown for sale item
export interface CreateSaleItemGemstoneData {
  gemstoneId: string;
  weight: number;
  ratePerCarat: number;
  gstRate: number;
}

// Create Payment Request
export interface CreateSalePaymentData {
  paymentMethod: PaymentMethod;
  amount: number;
  cardNumber?: string;
  upiTransactionId?: string;
  chequeNumber?: string;
  bankReference?: string;
  notes?: string;
}

// Update Sale Request
export interface UpdateSaleData {
  customerId?: string;
  saleLevelDiscount?: number;
  saleLevelDiscountType?: DiscountType;
  status?: SaleStatus;
  notes?: string;
}

// Sale Return Request
export interface CreateSaleReturnData {
  originalSaleId: string;
  returnType: ReturnType;
  reason: string;
  items: CreateSaleReturnItemData[];
  restockingFee?: number;
  notes?: string;
}

// Sale Return Item Request
export interface CreateSaleReturnItemData {
  saleItemId: string;
  returnQuantity: number;
  condition: ItemCondition;
  restockable?: boolean;
}

// POS Session Request
export interface CreatePosSessionData {
  openingCash: number;
  sessionNumber?: string;
}

export interface ClosePosSessionData {
  closingCash: number;
  notes?: string;
}

// API Response Types
export interface SaleResponse {
  sale: SaleWithDetails;
}

export interface SalesResponse {
  sales: SaleWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalePaymentResponse {
  payment: SalePaymentWithDetails;
  sale: Pick<Sale, 'id' | 'billNumber' | 'totalAmount' | 'paymentStatus'>;
}

export interface SaleReturnResponse {
  return: SaleReturnWithDetails;
}

export interface PosSessionResponse {
  session: PosSessionWithDetails;
}

export interface DailySalesSummaryResponse {
  summary: DailySalesSummaryWithDetails;
}

// Query Parameters
export interface SaleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  posSessionId?: string;
  sortBy?: 'saleDate' | 'totalAmount' | 'billNumber' | 'customer';
  sortOrder?: 'asc' | 'desc';
}

export interface SaleReturnQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReturnStatus;
  returnType?: ReturnType;
  startDate?: string;
  endDate?: string;
  sortBy?: 'returnDate' | 'returnAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PosSessionQueryParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'CLOSED' | 'RECONCILED';
  startDate?: string;
  endDate?: string;
  sortBy?: 'startTime' | 'totalSales' | 'totalTransactions';
  sortOrder?: 'asc' | 'desc';
}

// Statistics and Analytics
export interface SalesStats {
  totalSales: number;
  totalAmount: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalGst: number;
  topCustomers: {
    customer: Pick<Customer, 'id' | 'name' | 'phoneNumber'>;
    totalAmount: number;
    totalOrders: number;
  }[];
  paymentMethodBreakdown: {
    method: PaymentMethod;
    amount: number;
    count: number;
  }[];
  dailyTrends: {
    date: string;
    sales: number;
    amount: number;
  }[];
}

export interface MaterialSalesStats {
  materialType: MaterialType;
  totalWeight: number;
  totalValue: number;
  averageRate: number;
  salesCount: number;
}

export interface GemstoneSalesStats {
  gemstoneType: string;
  totalWeight: number;
  totalValue: number;
  averageRate: number;
  salesCount: number;
}

// Calculated Sale Pricing
export interface SalePricing {
  subtotal: number;
  itemLevelDiscount: number;
  saleLevelDiscount: number;
  totalDiscount: number;
  netAmount: number;
  gstOnMaterials: number;
  gstOnGemstones: number;
  gstOnMaking: number;
  totalGstAmount: number;
  totalAmount: number;
  roundOffAmount: number;
  finalAmount: number;
}

// Current Rate Information
export interface CurrentRateInfo {
  materials: {
    materialId: string;
    name: string;
    type: MaterialType;
    purity: string;
    currentRate: number;
    lastUpdated: Date;
  }[];
  gemstones: {
    gemstoneId: string;
    name: string;
    shape: GemstoneShape;
    clarity: string;
    color: string;
    currentRate: number;
    lastUpdated: Date;
  }[];
}