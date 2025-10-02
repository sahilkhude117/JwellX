import { z } from 'zod';
import { PaymentMethod, DiscountType, ChargeType } from '@/generated/prisma';
import { 
  SaleStatus, 
  ReturnType, 
  ReturnStatus, 
  ItemCondition,
  PosSessionStatus 
} from '@/lib/types/sales';

// Sale validation schemas
export const createSaleItemMaterialSchema = z.object({
  materialId: z.string().uuid('Invalid material ID'),
  weight: z.number().positive('Weight must be positive'),
  ratePerGram: z.number().positive('Rate per gram must be positive'),
  gstRate: z.number().min(0).max(100, 'GST rate must be between 0 and 100')
});

export const createSaleItemGemstoneSchema = z.object({
  gemstoneId: z.string().uuid('Invalid gemstone ID'),
  weight: z.number().positive('Weight must be positive'),
  ratePerCarat: z.number().positive('Rate per carat must be positive'),
  gstRate: z.number().min(0).max(100, 'GST rate must be between 0 and 100')
});

export const createSaleItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  materialBreakdown: z.array(createSaleItemMaterialSchema).min(1, 'At least one material is required'),
  gemstoneBreakdown: z.array(createSaleItemGemstoneSchema).optional().default([]),
  makingChargeType: z.nativeEnum(ChargeType),
  makingChargeRate: z.number().min(0, 'Making charge rate cannot be negative'),
  grossWeight: z.number().positive('Gross weight must be positive'),
  wastagePercentage: z.number().min(0).max(100, 'Wastage percentage must be between 0 and 100').optional().default(0),
  discountType: z.nativeEnum(DiscountType).optional().default(DiscountType.AMOUNT),
  discountValue: z.number().min(0, 'Discount value cannot be negative').optional().default(0),
  customization: z.string().max(500, 'Customization notes must be less than 500 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export const createSalePaymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().positive('Payment amount must be positive'),
  cardNumber: z.string().max(4, 'Card number should be last 4 digits only').optional(),
  upiTransactionId: z.string().max(100, 'UPI transaction ID too long').optional(),
  chequeNumber: z.string().max(50, 'Cheque number too long').optional(),
  bankReference: z.string().max(100, 'Bank reference too long').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  items: z.array(createSaleItemSchema).min(1, 'At least one item is required'),
  saleLevelDiscount: z.number().min(0, 'Sale level discount cannot be negative').optional().default(0),
  saleLevelDiscountType: z.nativeEnum(DiscountType).optional().default(DiscountType.AMOUNT),
  payments: z.array(createSalePaymentSchema).optional().default([]),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export const updateSaleSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  saleLevelDiscount: z.number().min(0, 'Sale level discount cannot be negative').optional(),
  saleLevelDiscountType: z.nativeEnum(DiscountType).optional(),
  status: z.nativeEnum(SaleStatus).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// Sale Return validation schemas
export const createSaleReturnItemSchema = z.object({
  saleItemId: z.string().uuid('Invalid sale item ID'),
  returnQuantity: z.number().int().positive('Return quantity must be a positive integer'),
  condition: z.nativeEnum(ItemCondition),
  restockable: z.boolean().optional().default(true)
});

export const createSaleReturnSchema = z.object({
  originalSaleId: z.string().uuid('Invalid sale ID'),
  returnType: z.nativeEnum(ReturnType),
  reason: z.string().min(1, 'Return reason is required').max(500, 'Return reason must be less than 500 characters'),
  items: z.array(createSaleReturnItemSchema).min(1, 'At least one item is required for return'),
  restockingFee: z.number().min(0, 'Restocking fee cannot be negative').optional().default(0),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export const updateSaleReturnSchema = z.object({
  status: z.nativeEnum(ReturnStatus),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// POS Session validation schemas
export const createPosSessionSchema = z.object({
  openingCash: z.number().min(0, 'Opening cash cannot be negative'),
  sessionNumber: z.string().max(50, 'Session number too long').optional()
});

export const closePosSessionSchema = z.object({
  closingCash: z.number().min(0, 'Closing cash cannot be negative'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// Payment validation schemas
export const addSalePaymentSchema = z.object({
  saleId: z.string().uuid('Invalid sale ID'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().positive('Payment amount must be positive'),
  cardNumber: z.string().max(4, 'Card number should be last 4 digits only').optional(),
  upiTransactionId: z.string().max(100, 'UPI transaction ID too long').optional(),
  chequeNumber: z.string().max(50, 'Cheque number too long').optional(),
  bankReference: z.string().max(100, 'Bank reference too long').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

// Query validation schemas
export const saleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(SaleStatus).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIALLY_PAID', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  posSessionId: z.string().uuid().optional(),
  sortBy: z.enum(['saleDate', 'totalAmount', 'billNumber', 'customer']).default('saleDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const saleReturnQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(ReturnStatus).optional(),
  returnType: z.nativeEnum(ReturnType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['returnDate', 'returnAmount', 'status']).default('returnDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const posSessionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(PosSessionStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['startTime', 'totalSales', 'totalTransactions']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Statistics query validation
export const salesStatsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional()
});

// Rate information validation
export const getCurrentRatesSchema = z.object({
  materialIds: z.array(z.string().uuid()).optional(),
  gemstoneIds: z.array(z.string().uuid()).optional()
});

// Bulk operations validation
export const bulkUpdateSalesSchema = z.object({
  saleIds: z.array(z.string().uuid()).min(1, 'At least one sale ID is required'),
  status: z.nativeEnum(SaleStatus).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export const bulkDeleteSalesSchema = z.object({
  saleIds: z.array(z.string().uuid()).min(1, 'At least one sale ID is required'),
  reason: z.string().min(1, 'Deletion reason is required').max(500, 'Reason must be less than 500 characters')
});

// Form validation schemas for frontend
export const saleFormSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    discountType: z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().min(0).optional(),
    customization: z.string().optional(),
    notes: z.string().optional()
  })).min(1, 'At least one item is required'),
  saleLevelDiscount: z.number().min(0).optional(),
  saleLevelDiscountType: z.nativeEnum(DiscountType).optional(),
  notes: z.string().optional()
});

export const paymentFormSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().positive('Amount must be positive'),
  cardNumber: z.string().optional(),
  upiTransactionId: z.string().optional(),
  chequeNumber: z.string().optional(),
  bankReference: z.string().optional(),
  notes: z.string().optional()
});

export const returnFormSchema = z.object({
  returnType: z.nativeEnum(ReturnType),
  reason: z.string().min(1, 'Return reason is required'),
  items: z.array(z.object({
    saleItemId: z.string().min(1, 'Sale item is required'),
    returnQuantity: z.number().min(1, 'Return quantity must be at least 1'),
    condition: z.nativeEnum(ItemCondition)
  })).min(1, 'At least one item is required'),
  restockingFee: z.number().min(0).optional(),
  notes: z.string().optional()
});