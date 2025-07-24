// src/components/products/add-product/forms/variant-card.tsx
'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus } from 'lucide-react';
import { MaterialSection } from './materials-section';
import { GemstoneSection } from './gemstone-section';

interface VariantCardProps {
  variantIndex: number;
  onRemove: () => void;
  canRemove: boolean;
}

export const VariantCard: React.FC<VariantCardProps> = ({
  variantIndex,
  onRemove,
  canRemove
}) => {
  const form = useFormContext();

  // Calculate total price for this variant
  const calculateVariantPrice = () => {
    const materials = form.watch(`variants.${variantIndex}.materials`) || [];
    const gemstones = form.watch(`variants.${variantIndex}.gemstones`) || [];
    const makingCharge = form.watch(`variants.${variantIndex}.makingCharge`) || 0;

    const materialCost = materials.reduce((total: number, material: any) => {
      return total + (material.weight * material.rate);
    }, 0);

    const gemstoneCost = gemstones.reduce((total: number, gemstone: any) => {
      return total + (gemstone.caratWeight * gemstone.rate);
    }, 0);

    return materialCost + gemstoneCost + makingCharge;
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg">Variant {variantIndex + 1}</CardTitle>
            <Badge variant="outline" className="text-xs">
              ₹{calculateVariantPrice().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Badge>
          </div>
          {canRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="border-destructive/30 text-destructive hover:bg-destructive/5"
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Variant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`variants.${variantIndex}.sku`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant SKU *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., RING-DIA-001-18W-S6" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`variants.${variantIndex}.totalWeight`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Weight (grams) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 5.5" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`variants.${variantIndex}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 10" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`variants.${variantIndex}.makingCharge`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Making Charge (₹) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 1500" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Fixed amount or percentage of material cost
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`variants.${variantIndex}.wastage`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wastage (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 5" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Materials Section */}
        <MaterialSection variantIndex={variantIndex} />

        <Separator />

        {/* Gemstones Section */}
        <GemstoneSection variantIndex={variantIndex} />

        {/* Variant Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Variant Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Materials</p>
              <p className="font-medium">
                {form.watch(`variants.${variantIndex}.materials`)?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gemstones</p>
              <p className="font-medium">
                {form.watch(`variants.${variantIndex}.gemstones`)?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Weight</p>
              <p className="font-medium">
                {form.watch(`variants.${variantIndex}.totalWeight`) || 0}g
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Price</p>
              <p className="font-medium">
                ₹{calculateVariantPrice().toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};