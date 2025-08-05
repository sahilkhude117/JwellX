'use client';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import MaterialComposition from './MaterialComposition';
import GemstoneDetails from './GemstoneDetails';
import PricingSection from './PricingSection';
import { CreateProductFormData, MaterialOption, GemstoneOption } from '@/lib/types/products/create-products';

interface VariantDetailsProps {
  variantIndex: number;
  hasGemstones: boolean;
  materials: MaterialOption[];
  gemstones: GemstoneOption[];
  isMaterialsLoading: boolean;
  isGemstonesLoading: boolean;
}

export default function VariantDetails({
  variantIndex,
  hasGemstones,
  materials,
  gemstones,
  isMaterialsLoading,
  isGemstonesLoading
}: VariantDetailsProps) {
  const { control, formState: { errors } } = useFormContext<CreateProductFormData>();
  
  // Helper functions to get field errors
  const getVariantError = (field: string) => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors) return undefined;
    return (variantErrors as any)[field] as any;
  };

  return (
    <div className="p-4 bg-muted/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Composition */}
        <MaterialComposition
          variantIndex={variantIndex}
          materials={materials}
          isMaterialsLoading={isMaterialsLoading}
        />
        
        {/* Gemstone Details */}
        {hasGemstones && (
          <GemstoneDetails
            variantIndex={variantIndex}
            gemstones={gemstones}
            isGemstonesLoading={isGemstonesLoading}
          />
        )}
        
        {/* Pricing Section */}
        <PricingSection 
          variantIndex={variantIndex}
          getVariantError={getVariantError}
        />
      </div>
    </div>
  );
}