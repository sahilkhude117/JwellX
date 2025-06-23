export type TransactionType = 
  | 'SALE_PAYMENT' 
  | 'ORDER_ADVANCE' 
  | 'REPAIR_PAYMENT' 
  | 'REFUND';

export type PaymentMethod = 
  | 'CASH' 
  | 'CREDIT_CARD' 
  | 'DEBIT_CARD' 
  | 'UPI' 
  | 'BANK_TRANSFER';

export type TransactionLogItem = {
  id: string;
  gatewayTransactionId?: string;
  timestamp: string;
  type: TransactionType;
  associatedDocument: {
    id: string;
    number: string;
  };
  paymentMethod: PaymentMethod;
  processedBy: {
    id: string;
    name: string;
  };
  amount: number;
};