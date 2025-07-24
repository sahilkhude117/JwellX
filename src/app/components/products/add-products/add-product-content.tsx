// src/components/products/add-product/add-product-content.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, Save, Plus, ArrowLeft } from 'lucide-react';
import { ProductDetailsForm } from './product-details-form';
import { ProductAttributesForm } from './product-attributes-form';
import { ProductVariantsForm } from './product-variants-form';
import { CreateProductFormData, createProductSchema } from '@/lib/types/products/create-products';
import { 
    createEmptyVariant,
    transformFormDataToApiInput,
    generateSKU,
    createEmptyAttribute
 } from '@/lib/utils/products/product-form-utils';
import { useCreateProduct, usePrefetchLookupData } from '@/hooks/products/use-products';
import { toast } from 'sonner';

// Form schema with proper validation
const formSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Name is too long"),
  sku: z.string().min(1, "Product SKU is required").max(100, "SKU is too long"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  hsnCode: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  attributes: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Attribute name is required"),
    value: z.string().min(1, "Attribute value is required"),
  })).default([]),
  variants: z.array(z.object({
    id: z.string(),
    sku: z.string().min(1, "Variant SKU is required"),
    totalWeight: z.number().min(0.01, "Total weight must be greater than 0"),
    makingCharge: z.number().min(0, "Making charge must be non-negative"),
    wastage: z.number().min(0, "Wastage must be non-negative").optional(),
    quantity: z.number().int().min(0, "Quantity must be non-negative"),
    materials: z.array(z.object({
      id: z.string(),
      materialId: z.string().min(1, "Material is required"),
      materialType: z.string(),
      purity: z.string().min(1, "Purity is required"),
      weight: z.number().min(0.01, "Weight must be greater than 0"),
      rate: z.number().min(0, "Rate must be non-negative"),
    })).min(1, "At least one material is required"),
    gemstones: z.array(z.object({
      id: z.string(),
      gemstoneId: z.string().min(1, "Gemstone is required"),
      gemstoneType: z.string(),
      caratWeight: z.number().min(0.01, "Carat weight must be greater than 0"),
      cut: z.string().optional(),
      color: z.string().optional(),
      clarity: z.string().optional(),
      certificationId: z.string().optional(),
      rate: z.number().min(0, "Rate must be non-negative"),
    })).default([]),
  })).min(1, "At least one variant is required"),
});

type FormData = z.infer<typeof formSchema>;

export const AddProductContent: React.FC = () => {
  const router = useRouter();
  const { prefetchAll } = usePrefetchLookupData();
  const createProductMutation = useCreateProduct();

  // Initialize form with default values
  // Update form initialization
    const form = useForm<CreateProductFormData>({
        //@ts-ignore
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            sku: '',
            description: '',
            category: undefined,
            brand: undefined,
            hsnCode: '',
            imageUrls: [],
            attributes: [createEmptyAttribute()],
            variants: [createEmptyVariant('', 0)],
        },
        mode: 'onChange',
    });

  // Prefetch lookup data on component mount
  useEffect(() => {
    prefetchAll();
  }, [prefetchAll]);

  // Generate SKU when product name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
        if (name === 'name' && value.name && !form.getValues('sku')) {
        const generatedSku = generateSKU(value.name);
        form.setValue('sku', generatedSku);
        
        // Update variant SKUs when product SKU changes
        const variants = form.getValues('variants');
        variants.forEach((_, index) => {
            const variantSku = generateSKU(generatedSku, index);
            form.setValue(`variants.${index}.sku`, variantSku);
        });
        }
    });
    return () => subscription.unsubscribe();
    }, [form]);

  const onSubmit = async (data: CreateProductFormData, saveAndAddAnother = false) => {
    try {
      const apiInput = transformFormDataToApiInput(data);
      await createProductMutation.mutateAsync(apiInput);
      
      if (saveAndAddAnother) {
        // Reset form but keep some values
        form.reset({
          name: '',
          sku: '',
          description: '',
          category: data.category, // Keep category
          brand: data.brand, // Keep brand
          hsnCode: '',
          imageUrls: [],
          attributes: [],
          variants: [createEmptyVariant('', 0)],
        });
        toast.success('Product saved! Ready to add another.');
      } else {
        router.push('/products/product-list');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to save product. Please try again.');
    }
  };

  const handleSave = form.handleSubmit((data:any) => onSubmit(data, false));
  const handleSaveAndAddAnother = form.handleSubmit((data: any) => onSubmit(data, true));

  const handleCancel = () => {
    router.push('/products/product-list');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Add New Product</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={createProductMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAndAddAnother} 
                variant="outline" 
                size="sm"
                disabled={createProductMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Save & Add Another
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={createProductMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createProductMutation.isPending ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormProvider {...form}>
          <form className="space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Product Details</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <ProductDetailsForm />
              </TabsContent>
              
              <TabsContent value="attributes" className="space-y-6">
                <ProductAttributesForm />
              </TabsContent>
              
              <TabsContent value="variants" className="space-y-6">
                <ProductVariantsForm />
              </TabsContent>
            </Tabs>
          </form>
        </FormProvider>
      </div>

      {/* Sticky Action Buttons */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={createProductMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAndAddAnother} 
              variant="outline"
              disabled={createProductMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Save & Add Another
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createProductMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createProductMutation.isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};