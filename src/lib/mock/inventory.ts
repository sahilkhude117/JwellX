import { ProductVariant, PurchaseLogRowData, StockAdjustmentLogItem, Supplier } from "../types/inventory";

export const mockSuppliers: Supplier[] = [
  { id: 'sup_1', name: 'Jaipur Gems & Co.' },
  { id: 'sup_2', name: 'Surat Diamond House' },
  { id: 'sup_3', name: 'Mumbai Jewelers' },
  { id: 'sup_4', name: 'Delhi Diamond Mart' },
];

export const mockProductVariants: ProductVariant[] = [
  { id: 'pv_1', sku: 'GOLD-RING-001', name: 'Gold Ring 18K - Size 7', currentStock: 5 },
  { id: 'pv_2', sku: 'GOLD-NECKLACE-002', name: 'Gold Necklace 22K - 16 inch', currentStock: 3 },
  { id: 'pv_3', sku: 'DIAMOND-EARRING-003', name: 'Diamond Earrings 1ct - Stud', currentStock: 8 },
  { id: 'pv_4', sku: 'SILVER-BRACELET-004', name: 'Silver Bracelet 925 - Chain', currentStock: 12 },
  { id: 'pv_5', sku: 'EMERALD-PENDANT-005', name: 'Emerald Pendant 2ct - Oval', currentStock: 2 },
];

export const mockPurchaseHistory: PurchaseLogRowData[] = [
  {
    id: 'pur_1',
    purchaseDate: '2025-06-10T10:00:00.000Z',
    supplier: { id: 'sup_1', name: 'Jaipur Gems & Co.' },
    referenceNumber: 'JGC-INV-5821',
    totalItems: 15,
    totalCost: 250000,
  },
  {
    id: 'pur_2',
    purchaseDate: '2025-05-25T15:30:00.000Z',
    supplier: { id: 'sup_2', name: 'Surat Diamond House' },
    referenceNumber: 'SDH-B2B-9904',
    totalItems: 3,
    totalCost: 680000,
  },
  {
    id: 'pur_3',
    purchaseDate: '2025-06-15T14:20:00.000Z',
    supplier: { id: 'sup_3', name: 'Mumbai Jewelers' },
    referenceNumber: 'MJ-2025-001',
    totalItems: 8,
    totalCost: 420000,
  },
];

export const mockStockAdjustmentHistory: StockAdjustmentLogItem[] = [
  {
    id: 'adj_1',
    timestamp: '2025-06-22T15:30:00.000Z',
    productVariant: { id: 'var_1a', sku: 'RING-001-A', name: 'Elegant Gold Ring (22K, 5.2g)' },
    user: { id: 'user_1', name: 'Amit Kumar' },
    adjustmentType: 'CORRECTION',
    quantityBefore: 6,
    quantityAfter: 5,
    change: -1,
    notes: 'Weekly stock audit correction. Physical count was 5.',
  },
  {
    id: 'adj_2',
    timestamp: '2025-06-20T10:00:00.000Z',
    productVariant: { id: 'var_6c', sku: 'PEND-003-D', name: 'Sapphire Pendant (1.5ct)' },
    user: { id: 'user_2', name: 'Priya Mehta' },
    adjustmentType: 'DAMAGE',
    quantityBefore: 3,
    quantityAfter: 2,
    change: -1,
    notes: 'Item dropped during customer viewing, clasp damaged beyond repair.',
  },
  {
    id: 'adj_3',
    timestamp: '2025-06-18T18:00:00.000Z',
    productVariant: { id: 'var_1a', sku: 'RING-001-A', name: 'Elegant Gold Ring (22K, 5.2g)' },
    user: { id: 'user_1', name: 'Amit Kumar' },
    adjustmentType: 'RETURN_TO_SUPPLIER',
    quantityBefore: 7,
    quantityAfter: 6,
    change: -1,
    notes: 'Returned to Jaipur Gems & Co. due to manufacturing defect.',
  },
  {
    id: 'adj_4',
    timestamp: '2025-06-17T14:20:00.000Z',
    productVariant: { id: 'var_2b', sku: 'NECK-002-B', name: 'Diamond Necklace (18K White Gold)' },
    user: { id: 'user_3', name: 'Rajesh Sharma' },
    adjustmentType: 'MARKETING_SAMPLE',
    quantityBefore: 4,
    quantityAfter: 3,
    change: -1,
    notes: 'Provided to fashion photographer for upcoming catalog shoot.',
  },
  {
    id: 'adj_5',
    timestamp: '2025-06-15T11:45:00.000Z',
    productVariant: { id: 'var_4a', sku: 'BRAC-004-A', name: 'Pearl Bracelet (Freshwater, 7mm)' },
    user: { id: 'user_2', name: 'Priya Mehta' },
    adjustmentType: 'THEFT_LOSS',
    quantityBefore: 8,
    quantityAfter: 7,
    change: -1,
    notes: 'Discovered missing during evening inventory check. Security footage being reviewed.',
  },
  {
    id: 'adj_6',
    timestamp: '2025-06-14T09:30:00.000Z',
    productVariant: { id: 'var_5c', sku: 'EARR-005-C', name: 'Ruby Earrings (2ct, Gold Setting)' },
    user: { id: 'user_1', name: 'Amit Kumar' },
    adjustmentType: 'CORRECTION',
    quantityBefore: 2,
    quantityAfter: 4,
    change: 2,
    notes: 'Previous count was incorrect. Found 2 additional units in secure storage.',
  },
];