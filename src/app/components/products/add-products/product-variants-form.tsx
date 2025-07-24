// src/components/products/add-product/forms/product-variants-form.tsx
'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VariantCard } from './variant-card';
import { createEmptyVariant, generateSKU } from '@/lib/utils/products/product-form-utils';
export const ProductVariantsForm: React.FC = () => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const handleAddVariant = () => {
    const productName = form.getValues('name');
    const productSku = form.getValues('sku');
    const variantCount = fields.length + 1;
    
    const newVariant = createEmptyVariant();
    // Generate variant SKU based on product SKU
    if (productSku) {
      newVariant.sku = `${productSku}-V${variantCount}`;
    } else if (productName) {
      newVariant.sku = `${generateSKU(productName)}-V${variantCount + 1}`;
    }
    
    append(newVariant);
  };

  const handleRemoveVariant = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5" />
            <div>
              <CardTitle>Product Variants</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Define different versions of this product (e.g., different sizes, metal purity, or gemstones). 
                Each variant has its own SKU, pricing, and inventory.
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {fields.length} {fields.length === 1 ? 'Variant' : 'Variants'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {fields.map((field, index) => (
            <VariantCard
              key={field.id}
              variantIndex={index}
              onRemove={() => handleRemoveVariant(index)}
              canRemove={fields.length > 1}
            />
          ))}
          
          <Button
            variant="outline"
            onClick={handleAddVariant}
            className="w-full h-12 border-dashed"
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Variant
          </Button>
        </div>

        {/* Variant Summary */}
        {fields.length > 1 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Variant Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{fields.length}</p>
                <p className="text-sm text-muted-foreground">Total Variants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {fields.reduce((total, _, index) => {
                    const quantity = form.watch(`variants.${index}.quantity`) || 0;
                    return total + quantity;
                  }, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {fields.reduce((total, _, index) => {
                    const weight = form.watch(`variants.${index}.totalWeight`) || 0;
                    return total + weight;
                  }, 0).toFixed(2)}g
                </p>
                <p className="text-sm text-muted-foreground">Total Weight</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};