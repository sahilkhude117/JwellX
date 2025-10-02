'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2,
  Receipt,
  CheckCircle,
  AlertCircle,
  Printer,
  Mail,
  Download,
  ArrowLeft,
  Calculator
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Customer } from './CustomerSelector';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  requiresReference?: boolean;
  requiresCardDetails?: boolean;
}

export interface Payment {
  method: string;
  amount: number;
  reference?: string;
  cardLast4?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface TransactionSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  payments: Payment[];
  customer?: Customer | null;
}

interface PaymentProcessorProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionSummary;
  onPaymentComplete: (payments: Payment[]) => void;
  onPrintReceipt?: () => void;
  onEmailReceipt?: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Cash',
    icon: <Banknote className="h-5 w-5" />,
  },
  {
    id: 'card',
    name: 'Card',
    icon: <CreditCard className="h-5 w-5" />,
    requiresCardDetails: true,
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: <Smartphone className="h-5 w-5" />,
    requiresReference: true,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Building2 className="h-5 w-5" />,
    requiresReference: true,
  },
];

export function PaymentProcessor({
  isOpen,
  onClose,
  transaction,
  onPaymentComplete,
  onPrintReceipt,
  onEmailReceipt
}: PaymentProcessorProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = transaction.total - totalPaid;
  const isFullyPaid = remainingBalance <= 0;

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;

    const payment: Payment = {
      method: selectedMethod,
      amount: Math.min(amount, remainingBalance),
      reference: reference || undefined,
      cardLast4: cardLast4 || undefined,
      status: 'completed'
    };

    setPayments(prev => [...prev, payment]);
    setPaymentAmount('');
    setReference('');
    setCardLast4('');
  };

  const handleRemovePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteTransaction = async () => {
    if (!isFullyPaid) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setShowReceipt(true);
      onPaymentComplete(payments);
    }, 2000);
  };

  const handleQuickAmount = (percentage: number) => {
    const amount = (remainingBalance * percentage / 100).toFixed(2);
    setPaymentAmount(amount);
  };

  const resetPaymentForm = () => {
    setPaymentAmount('');
    setReference('');
    setCardLast4('');
  };

  if (showReceipt) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Transaction Complete
            </DialogTitle>
            <DialogDescription>
              Payment has been processed successfully
            </DialogDescription>
          </DialogHeader>

          {/* Receipt Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Receipt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(transaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(transaction.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(transaction.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(transaction.total)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(totalPaid)}</span>
                </div>
                {remainingBalance < 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Change:</span>
                    <span>{formatCurrency(Math.abs(remainingBalance))}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-medium">Payments:</Label>
                {payments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="capitalize">{payment.method}</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>

              {transaction.customer && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <Label className="font-medium">Customer:</Label>
                    <p>{transaction.customer.name}</p>
                    {transaction.customer.phone && (
                      <p className="text-muted-foreground">{transaction.customer.phone}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="flex-col gap-2">
            <div className="flex gap-2 w-full">
              {onPrintReceipt && (
                <Button onClick={onPrintReceipt} variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              )}
              {onEmailReceipt && transaction.customer?.email && (
                <Button onClick={onEmailReceipt} variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Transaction Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold text-lg">{formatCurrency(transaction.total)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Balance:</span>
                  <span className={`font-medium ${remainingBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
                {remainingBalance < 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Change to Return:</span>
                    <span className="font-medium">{formatCurrency(Math.abs(remainingBalance))}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="font-medium">Select Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedMethod === method.id ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedMethod(method.id);
                    resetPaymentForm();
                  }}
                  className="h-16 flex-col gap-2"
                >
                  {method.icon}
                  <span className="text-sm">{method.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="space-y-2">
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  max={remainingBalance}
                  step="0.01"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(remainingBalance.toFixed(2))}
                  >
                    Full Amount
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(50)}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(25)}
                  >
                    25%
                  </Button>
                </div>
              </div>
            </div>

            {/* Method-specific fields */}
            {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.requiresReference && (
              <div className="space-y-2">
                <Label htmlFor="reference">
                  {selectedMethod === 'upi' ? 'UPI Transaction ID' : 'Reference Number'}
                </Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={`Enter ${selectedMethod === 'upi' ? 'UPI transaction ID' : 'reference number'}`}
                />
              </div>
            )}

            {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.requiresCardDetails && (
              <div className="space-y-2">
                <Label htmlFor="cardLast4">Card Last 4 Digits</Label>
                <Input
                  id="cardLast4"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.slice(0, 4))}
                  placeholder="Last 4 digits"
                  maxLength={4}
                />
              </div>
            )}

            <Button
              onClick={handleAddPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              className="w-full"
            >
              Add Payment
            </Button>
          </div>

          {/* Payment List */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <Label className="font-medium">Added Payments</Label>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      {PAYMENT_METHODS.find(m => m.id === payment.method)?.icon}
                      <div>
                        <div className="font-medium capitalize">{payment.method}</div>
                        {payment.reference && (
                          <div className="text-xs text-muted-foreground">
                            Ref: {payment.reference}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePayment(index)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteTransaction}
            disabled={!isFullyPaid || isProcessing || payments.length === 0}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : isFullyPaid ? (
              'Complete Sale'
            ) : (
              `Pay ${formatCurrency(remainingBalance)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}