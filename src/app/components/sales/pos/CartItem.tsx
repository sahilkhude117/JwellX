'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Minus, 
  Plus, 
  Trash2,
  Package,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number;
  image?: string;
  category: string;
  discount?: {
    type: 'PERCENTAGE' | 'AMOUNT';
    value: number;
  };
  materialBreakdown?: {
    materialId: string;
    materialName: string;
    weight: number;
    ratePerGram: number;
    value: number;
  }[];
}

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateDiscount?: (id: string, discount: CartItem['discount']) => void;
}

export function CartItemComponent({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem,
  onUpdateDiscount 
}: CartItemComponentProps) {
  const subtotal = item.price * item.quantity;
  const discountAmount = item.discount 
    ? item.discount.type === 'PERCENTAGE' 
      ? (subtotal * item.discount.value) / 100
      : item.discount.value * item.quantity
    : 0;
  const total = subtotal - discountAmount;

  return (
    <div className="group p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight line-clamp-2">
                {item.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                SKU: {item.sku}
              </p>
              {item.weight && (
                <p className="text-xs text-muted-foreground">
                  Weight: {item.weight}g
                </p>
              )}
              <Badge variant="outline" className="mt-1 h-5 text-xs">
                {item.category}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(item.id)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {/* Material Breakdown */}
          {item.materialBreakdown && item.materialBreakdown.length > 0 && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
              <div className="font-medium mb-1">Material Breakdown:</div>
              {item.materialBreakdown.map((material, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{material.materialName} ({material.weight}g)</span>
                  <span>{formatCurrency(material.value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pricing and Quantity */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Rate: </span>
              <span className="font-medium">{formatCurrency(item.price)}</span>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-8 text-center text-sm"
                min="1"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Discount and Total */}
          <div className="mt-2 text-sm">
            {item.discount && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}