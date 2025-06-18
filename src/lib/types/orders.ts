// types/orders.ts

export type CustomOrderStatus = 
  | 'QUOTED' 
  | 'ADVANCE_PENDING' 
  | 'IN_PROGRESS' 
  | 'QUALITY_CHECK' 
  | 'READY_FOR_DELIVERY' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type CustomOrderRowData = {
  id: string;
  orderNumber: string; // e.g., 'ORD-C-001'
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  orderDate: string; // ISO Date String
  expectedDeliveryDate: string; // ISO Date String
  description: string; // Brief of the custom work
  totalAmount: number;
  advancePaid: number;
  status: CustomOrderStatus;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
};

export type CreateCustomOrderData = {
  customerId: string;
  description: string;
  totalAmount: number;
  advancePayment: number;
  expectedDeliveryDate: string;
};

export const statusColors: Record<CustomOrderStatus, string> = {
  QUOTED: 'bg-blue-100 text-blue-800',
  ADVANCE_PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  QUALITY_CHECK: 'bg-orange-100 text-orange-800',
  READY_FOR_DELIVERY: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};