'use client';

import { useFormContext } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, PieChart, CheckCircle2 } from 'lucide-react';
import { CreateProductFormData } from '@/lib/types/products/create-products';

export default function Summary() {
  const { watch, formState: { errors, isValid } } = useFormContext<CreateProductFormData>();
  
  const watchedValues = watch();
  const variants = watchedValues.variants || [];
  const attributes = watchedValues.attributes || [];

  // Check if product has gemstones
  const hasGemstones = attributes.some(attr => attr.name === 'hasGemstones' && attr.value === 'true');
  const isCustomizable = attributes.some(attr => attr.name === 'isCustomizable' && attr.value === 'true');

  // Validation checks
  const hasHighWastage = variants.some((variant: any) => 
    Number(variant.wastage) > 15
  );

  const missingPurityCert = watchedValues.hsnCode === '7113' && 
    !variants.some((variant: any) => 
      variant.materials?.some((material: any) => material.purity)
    );

  const hasEmptyVariants = variants.some((variant: any) => 
    !variant.materials || variant.materials.length === 0
  );

  const totalVariants = variants.length;
  const variantsWithGemstones = variants.filter((variant: any) => 
    variant.gemstones && variant.gemstones.length > 0
  ).length;

  // Calculate total stock
  const totalStock = variants.reduce((sum: number, variant: any) => 
    sum + (Number(variant.quantity) || 0), 0
  );

  // Get form validation status
  const getValidationStatus = () => {
    if (Object.keys(errors).length === 0 && isValid) {
      return { status: 'valid', message: 'All validations passed' };
    } else if (Object.keys(errors).length > 0) {
      return { status: 'error', message: 'Please fix validation errors' };
    } else {
      return { status: 'warning', message: 'Please complete all required fields' };
    }
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <h2 className="text-xl font-semibold">Summary & Validation</h2>

      {/* Validation Status */}
      <Alert variant={validationStatus.status === 'error' ? 'destructive' : 'default'}>
        {validationStatus.status === 'valid' ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>Form Validation</AlertTitle>
        <AlertDescription>{validationStatus.message}</AlertDescription>
      </Alert>

      {/* Validation Alerts */}
      {hasHighWastage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>High Wastage Detected</AlertTitle>
          <AlertDescription>
            Some variants have wastage greater than 15%. Please confirm these values are correct.
          </AlertDescription>
        </Alert>
      )}

      {missingPurityCert && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Purity Certification Required</AlertTitle>
          <AlertDescription>
            HSN 7113 (Gold Jewelry) requires purity certification documentation.
          </AlertDescription>
        </Alert>
      )}

      {hasEmptyVariants && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Empty Variants Detected</AlertTitle>
          <AlertDescription>
            Some variants don't have materials. Each variant must have at least one material.
          </AlertDescription>
        </Alert>
      )}

      {/* Product Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="font-semibold mb-3">Product Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Product Name:</span>
              <span className="font-medium">
                {watchedValues.name || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>SKU:</span>
              <span className="font-medium font-mono text-sm">
                {watchedValues.sku || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Category:</span>
              <span className="font-medium">
                {watchedValues.category ? 'Selected' : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Brand:</span>
              <span className="font-medium">
                {watchedValues.brand ? 'Selected' : 'Optional'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>HSN Code:</span>
              <Badge variant={watchedValues.hsnCode ? "default" : "secondary"}>
                {watchedValues.hsnCode || 'Not specified'}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Product Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Total Variants:</span>
              <Badge variant="secondary">{totalVariants}</Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Total Stock:</span>
              <Badge variant={totalStock > 0 ? "default" : "destructive"}>
                {totalStock} units
              </Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>With Gemstones:</span>
              <Badge variant={hasGemstones ? "default" : "secondary"}>
                {hasGemstones ? `${variantsWithGemstones} variants` : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Customizable:</span>
              <Badge variant={isCustomizable ? "default" : "secondary"}>
                {isCustomizable ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span>Attributes:</span>
              <Badge variant={attributes.length > 0 ? "default" : "secondary"}>
                {attributes.length} set
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes Summary */}
      {attributes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Attributes Summary</h3>
          <div className="flex flex-wrap gap-2">
            {attributes
              .filter(attr => !['hasGemstones', 'isCustomizable'].includes(attr.name))
              .map((attr, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attr.name}: {attr.value}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Variants Summary */}
      {variants.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Variants Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">SKU</th>
                  <th className="text-left p-2">Weight (g)</th>
                  <th className="text-left p-2">Materials</th>
                  <th className="text-left p-2">Gemstones</th>
                  <th className="text-left p-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {variants.slice(0, 5).map((variant: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-mono text-xs">
                      {variant.sku || `Variant ${index + 1}`}
                    </td>
                    <td className="p-2">{variant.totalWeight || 0}g</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {variant.materials?.length || 0} materials
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {variant.gemstones?.length || 0} gemstones
                      </Badge>
                    </td>
                    <td className="p-2">{variant.quantity || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {variants.length > 5 && (
              <p className="text-sm text-muted-foreground mt-2 p-2">
                ... and {variants.length - 5} more variants
              </p>
            )}
          </div>
        </div>
      )}

      {/* Form Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Form Validation Errors</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {errors.name && <div>• Product name is required</div>}
              {errors.sku && <div>• Product SKU is required</div>}
              {errors.category && <div>• Category selection is required</div>}
              {errors.variants && (
                <div>• Please check variant details and fix any validation errors</div>
              )}
              {Object.keys(errors).length > 4 && (
                <div className="text-sm">... and other validation errors</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Ready to Submit */}
      {isValid && Object.keys(errors).length === 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Ready to Submit</AlertTitle>
          <AlertDescription>
            All validations have passed. Your product is ready to be created.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}