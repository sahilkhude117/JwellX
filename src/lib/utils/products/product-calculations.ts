import { VariantFormData } from '@/lib/types/products/create-products';

// Helper functions for cost calculations
export const calculateMaterialCost = (variant: VariantFormData): number => {
  return variant.materials.reduce((sum: number, material: any) => {
    return sum + (material.weight * material.rate);
  }, 0);
};

export const calculateGemstoneCost = (variant: VariantFormData): number => {
  return variant.gemstones.reduce((sum: number, gemstone: any) => {
    return sum + (gemstone.caratWeight * gemstone.rate);
  }, 0);
};

export const calculateTotalCost = (variant: VariantFormData): number => {
  const materialCost = calculateMaterialCost(variant);
  const gemstoneCost = calculateGemstoneCost(variant);
  const makingCharge = variant.makingCharge || 0;
  return materialCost + gemstoneCost + makingCharge;
};