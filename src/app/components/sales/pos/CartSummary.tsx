'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart,
  Calculator,
  Percent,
  Receipt,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, CartItemComponent } from './CartItem';

// Re-export CartItem for use in other components
export type { CartItem };

interface CartSummaryProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateDiscount?: (id: string, discount: CartItem['discount']) => void;
  onCheckout: (summary: CartCalculation) => void;
  isCheckingOut?: boolean;
}

interface CartCalculation {
  subtotal: number;
  totalDiscount: number;
  saleLevelDiscount: number;
  taxAmount: number;
  grandTotal: number;
  totalItems: number;
  totalWeight: number;
}

export function CartSummary({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onUpdateDiscount,
  onCheckout,
  isCheckingOut = false
}: CartSummaryProps) {
  const [saleLevelDiscount, setSaleLevelDiscount] = useState(0);
  const [saleLevelDiscountType, setSaleLevelDiscountType] = useState<'PERCENTAGE' | 'AMOUNT'>('AMOUNT');
  const [taxRate, setTaxRate] = useState(3); // GST rate

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const itemDiscounts = items.reduce((sum, item) => {
    if (!item.discount) return sum;
    const itemSubtotal = item.price * item.quantity;
    return sum + (item.discount.type === 'PERCENTAGE' 
      ? (itemSubtotal * item.discount.value) / 100
      : item.discount.value * item.quantity);
  }, 0);

  const saleLevelDiscountAmount = saleLevelDiscountType === 'PERCENTAGE'
    ? (subtotal * saleLevelDiscount) / 100
    : saleLevelDiscount;

  const discountedAmount = subtotal - itemDiscounts - saleLevelDiscountAmount;
  const taxAmount = (discountedAmount * taxRate) / 100;
  const grandTotal = discountedAmount + taxAmount;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0);

  const calculation: CartCalculation = {
    subtotal,
    totalDiscount: itemDiscounts + saleLevelDiscountAmount,
    saleLevelDiscount: saleLevelDiscountAmount,
    taxAmount,
    grandTotal,
    totalItems,
    totalWeight
  };

  const handleCheckout = () => {
    onCheckout(calculation);
  };

  if (items.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your cart is empty</p>
            <p className="text-sm">Add items to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </div>
          <Badge variant="secondary">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Cart Items */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
                onUpdateDiscount={onUpdateDiscount}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Sale Level Discount */}
        <div className="p-6 border-t">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Sale Level Discount
            </Label>
            <div className="flex gap-2">
              <Select 
                value={saleLevelDiscountType} 
                onValueChange={(value: 'PERCENTAGE' | 'AMOUNT') => setSaleLevelDiscountType(value)}
              >
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMOUNT">₹</SelectItem>
                  <SelectItem value="PERCENTAGE">%</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={saleLevelDiscount}
                onChange={(e) => setSaleLevelDiscount(parseFloat(e.target.value) || 0)}
                className="flex-1 h-9"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 border-t bg-muted/20">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {(itemDiscounts > 0 || saleLevelDiscountAmount > 0) && (
              <div className="flex justify-between text-green-600">
                <span>Total Discount:</span>
                <span>-{formatCurrency(itemDiscounts + saleLevelDiscountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>GST ({taxRate}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            
            {totalWeight > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Total Weight:</span>
                <span>{totalWeight.toFixed(2)}g</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut || items.length === 0}
            className="w-full mt-4 h-12"
            size="lg"
          >
            {isCheckingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Checkout {formatCurrency(grandTotal)}
              </>
            )}
          </Button>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="flex-1 h-9">
              <Receipt className="w-4 h-4 mr-1" />
              Quote
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-9">
              <Calculator className="w-4 h-4 mr-1" />
              Hold
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}