'use client';

import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { CreateProductFormData } from '@/lib/types/products/create-products';
import { useEffect, useState } from 'react';

const HSN_CODES = [
  { code: '7113', description: 'Gold Jewelry' },
  { code: '7115', description: 'Silver Jewelry' },
  { code: '7116', description: 'Platinum Jewelry' },
  { code: '7117', description: 'Pearl Jewelry' },
] as const;

const generateSkuFromName = (name: string, counter: number = 0): string => {
  if (!name) return '';

  const baseSku = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')  
    .replace(/-+$/, '')        
    .replace(/^-+/, '');           
    
  return counter > 0 ? `${baseSku}-${counter}` : baseSku;
};

export default function ProductDetails() {
  const { control, watch, formState: { errors }, getValues, setValue } = useFormContext<CreateProductFormData>();

  const productName = useWatch({
    control,
    name: 'name'
  })

  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [skuCounter, setSkuCounter] = useState(0);

   useEffect(() => {
    setSkuManuallyEdited(false);
    setSkuCounter(0); // Reset counter when name changes
  }, [productName]);

  // Generate SKU whenever the product name changes (if not manually edited)
  useEffect(() => {
    if (productName && !skuManuallyEdited) {
      const newSku = generateSkuFromName(productName, skuCounter);
      setValue('sku', newSku, { shouldValidate: true });
    }
  }, [productName, skuCounter, skuManuallyEdited, setValue]);


  useEffect(() => {
    if (errors.sku?.message?.includes('already exists')) {
      // Increment counter to generate a new SKU
      setSkuCounter(prev => prev + 1);
    }
  }, [errors.sku]);


  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Product name is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="e.g., Gold Solitaire Ring"
                  className={errors.name ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.name && (
              <span className="text-sm text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">
              SKU <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="sku"
              control={control}
              rules={{ required: 'SKU is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="sku"
                  placeholder="e.g., RING-GOLD"
                  className={errors.sku ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.sku && (
              <span className="text-sm text-destructive">
                {errors.sku.message}
              </span>
            )}
          </div>

          {/* HSN Code */}
          <div className="space-y-2">
            <Label>HSN Code</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Controller
                  name="hsnCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="block w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8"
                    >
                      <option value="">Select HSN code...</option>
                      {HSN_CODES.map((hsn) => (
                        <option key={hsn.code} value={hsn.code}>
                          {hsn.code} - {hsn.description}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {watch('hsnCode') && (
                <Badge variant="secondary" className="self-center whitespace-nowrap">
                  {HSN_CODES.find(h => h.code === watch('hsnCode'))?.description}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="relative">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Enter product description..."
                    className="min-h-[120px]"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}