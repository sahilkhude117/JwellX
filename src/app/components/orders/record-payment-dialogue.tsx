'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { CustomOrderRowData } from '@/lib/types/orders';

interface RecordPaymentDialogProps {
  order: CustomOrderRowData;
  onPaymentRecord: (orderId: string, amount: number) => void;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  notes?: string;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

export function RecordPaymentDialog({ order, onPaymentRecord }: RecordPaymentDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  
  const remainingAmount = order.totalAmount - order.advancePaid;
  const paymentProgress = (order.advancePaid / order.totalAmount) * 100;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>();

  const watchedAmount = watch('amount');
  const watchedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: PaymentFormData) => {
    setIsRecording(true);
    try {
      onPaymentRecord(order.id, Number(data.amount));
      reset();
    } finally {
      setIsRecording(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round(remainingAmount * percentage);
    setValue('amount', amount);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Record Payment</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground">{order.customer.name}</div>
            </div>
            <Badge variant="outline">
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Paid:</span>
              <span className="font-medium">{formatCurrency(order.advancePaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <span className="font-medium text-orange-600">{formatCurrency(remainingAmount)}</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        </div>

        {/* Payment Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0"
            {...register('amount', {
              required: 'Payment amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' },
              max: { value: remainingAmount, message: 'Amount cannot exceed remaining balance' },
            })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(0.25)}
              disabled={remainingAmount <= 0}
            >
              25% ({formatCurrency(remainingAmount * 0.25)})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(0.5)}
              disabled={remainingAmount <= 0}
            >
              50% ({formatCurrency(remainingAmount * 0.5)})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(1)}
              disabled={remainingAmount <= 0}
            >
              Full ({formatCurrency(remainingAmount)})
            </Button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method *</Label>
          <Select onValueChange={(value) => setValue('paymentMethod', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!watchedPaymentMethod && (
            <p className="text-sm text-destructive">Please select a payment method</p>
          )}
        </div>

        {/* Payment Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes about this payment..."
            {...register('notes')}
            rows={3}
          />
        </div>

        {/* Payment Preview */}
        {watchedAmount && watchedPaymentMethod && (
          <div className="rounded-lg border p-4 bg-green-50">
            <h4 className="font-medium mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Payment Amount:</span>
                <span className="font-medium">{formatCurrency(Number(watchedAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">
                  {paymentMethods.find(m => m.value === watchedPaymentMethod)?.label}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>New Balance:</span>
                <span className="font-medium">
                  {formatCurrency(order.advancePaid + Number(watchedAmount))} / {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-medium">
                  {formatCurrency(remainingAmount - Number(watchedAmount))}
                </span>
              </div>
            </div>
          </div>
        )}

        {remainingAmount <= 0 && (
          <div className="rounded-lg border p-4 bg-yellow-50">
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> This order is already fully paid. Recording additional payments will not increase the total.
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isRecording || !watchedPaymentMethod || !watchedAmount}
          >
            {isRecording ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}