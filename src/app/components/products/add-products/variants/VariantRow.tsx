'use client';
import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import VariantDetails from './VariantDetails';
import { CreateProductFormData, MaterialOption, GemstoneOption, VariantFormData } from '@/lib/types/products/create-products';

interface VariantRowProps {
  variant: VariantFormData;
  variantIndex: number;
  isExpanded: boolean;
  toggleRow: (id: string) => void;
  onDelete: (index: number) => void;
  productSku: string | undefined;
  hasGemstones: boolean;
  materials: MaterialOption[];
  gemstones: GemstoneOption[];
  isMaterialsLoading: boolean;
  isGemstonesLoading: boolean;
}

export default function VariantRow({
  variant,
  variantIndex,
  isExpanded,
  toggleRow,
  onDelete,
  productSku,
  hasGemstones,
  materials,
  gemstones,
  isMaterialsLoading,
  isGemstonesLoading
}: VariantRowProps) {
  const { control, formState: { errors } } = useFormContext<CreateProductFormData>();
  
  // Get the field array methods directly in this component
  const { fields: variants, append } = useFieldArray({
    control,
    name: "variants" as const
  });
  
  // Helper functions to get field errors
  const getVariantError = (field: string) => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors) return undefined;
    return (variantErrors as any)[field] as any;
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Controller
            name={`variants.${variantIndex}.sku` as const}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled={!productSku}
                className={getVariantError('sku') ? 'border-destructive' : ''}
                placeholder={productSku ? "Enter SKU" : "Enter product SKU first"}
                onChange={(e) => {
                  field.onChange(e);
                }}
              />
            )}
          />
          {getVariantError('sku') && (
            <span className="text-xs text-destructive">
              {getVariantError('sku')?.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Controller
              name={`variants.${variantIndex}.totalWeight` as const}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  className={getVariantError('totalWeight') ? 'border-destructive' : ''}
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                  }}
                />
              )}
            />
            <Badge variant="outline" className="text-xs">g</Badge>
          </div>
          {getVariantError('totalWeight') && (
            <span className="text-xs text-destructive">
              {getVariantError('totalWeight')?.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Controller
            name={`variants.${variantIndex}.quantity` as const}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                min="1"
                className={getVariantError('quantity') ? 'border-destructive' : ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  field.onChange(value);
                }}
              />
            )}
          />
          {getVariantError('quantity') && (
            <span className="text-xs text-destructive">
              {getVariantError('quantity')?.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Badge 
            variant={variant.materials.length > 0 ? "default" : "destructive"}
            className="text-xs"
          >
            {variant.materials.length} {variant.materials.length === 1 ? 'material' : 'materials'}
          </Badge>
          {getVariantError('materials') && (
            <span className="block text-xs text-destructive mt-1">
              {getVariantError('materials')?.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Badge 
            variant={variant.gemstones.length > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            {variant.gemstones.length} {variant.gemstones.length === 1 ? 'gemstone' : 'gemstones'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              onClick={() => toggleRow(variant.id)}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              onClick={() => {
                // Generate next index based on current variants count
                const nextIndex = variants.length + 1;
                // Create SKU in format: VAR-{productSku}-{index}
                const newSku = productSku ? `VAR-${productSku}-${nextIndex}` : '';
                
                const newVariant = { 
                  ...variant, 
                  id: Math.random().toString(36).substr(2, 9),
                  sku: newSku
                };
                append(newVariant);
              }}
              aria-label="Copy variant"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(variantIndex)}
              aria-label="Delete variant"
              disabled={false}
              title={variantIndex === 0 ? "At least one variant is required" : undefined}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Expandable Details */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <VariantDetails
              variantIndex={variantIndex}
              hasGemstones={hasGemstones}
              materials={materials}
              gemstones={gemstones}
              isMaterialsLoading={isMaterialsLoading}
              isGemstonesLoading={isGemstonesLoading}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}