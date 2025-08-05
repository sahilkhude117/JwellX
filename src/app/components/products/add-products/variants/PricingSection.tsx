'use client';
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { calculateMaterialCost, calculateGemstoneCost, calculateTotalCost } from '@/lib/utils/products/product-calculations';
import { CreateProductFormData, VariantFormData } from '@/lib/types/products/create-products';
import { Label } from '@/components/ui/label';

interface PricingSectionProps {
  variantIndex: number;
  getVariantError: (field: string) => any;
}

export default function PricingSection({
  variantIndex,
  getVariantError
}: PricingSectionProps) {
  const { control, watch } = useFormContext<CreateProductFormData>();
  const variant = watch(`variants.${variantIndex}`) as VariantFormData;
  
  return (
    <div className="lg:col-span-2">
      <h3 className="font-semibold mb-3">Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label>Making Charge ($)</Label>
          <Controller
            name={`variants.${variantIndex}.makingCharge` as const}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                className={getVariantError('makingCharge') ? 'border-destructive' : ''}
                placeholder="0.00"
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  field.onChange(value);
                }}
              />
            )}
          />
          {getVariantError('makingCharge') && (
            <span className="text-xs text-destructive mt-1">
              {getVariantError('makingCharge')?.message}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <Label>Wastage (%)</Label>
          <Controller
            name={`variants.${variantIndex}.wastage` as const}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.1"
                placeholder="0.0"
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  field.onChange(value);
                }}
              />
            )}
          />
          {Number(variant.wastage) > 15 && (
            <div className="flex items-center text-destructive text-xs mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              High wastage
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label>Total Material Cost</Label>
          <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
            ${calculateMaterialCost(variant).toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <Label>Total Gemstone Cost</Label>
          <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
            ${calculateGemstoneCost(variant).toFixed(2)}
          </div>
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Total Cost</Label>
          <div className="flex items-center h-10 px-3 border rounded-md bg-muted font-medium">
            ${calculateTotalCost(variant).toFixed(2)}
          </div>
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Retail Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="Enter retail price"
          />
        </div>
      </div>
    </div>
  );
}