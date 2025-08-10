'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Types
export type FullProductPayload = {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  hsnCode?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  brandId?: string | null;
  attributes: { attributeId: string; value: string }[];
  variants: {
    id: string;
    sku: string;
    weight: number;
    makingCharge: number;
    wastage?: number | null;
    quantity: number;
    materials: { materialId: string; purity: string; weight: number }[];
    gemstones: {
      gemstoneId: string;
      caratWeight: number;
      cut?: string | null;
      color?: string | null;
      clarity?: string | null;
      certificationId?: string | null;
    }[];
  }[];
};

export type UpdateProductPayload = {
  name?: string;
  description?: string | null;
  hsnCode?: string | null;
  imageUrl?: string | null;
  categoryId?: string;
  brandId?: string | null;
  attributes?: { attributeId: string; value: string }[];
  variantsToUpdate: { id: string; sku: string; weight: number; makingCharge: number; wastage?: number | null; quantity: number; materials: { materialId: string; purity: string; weight: number }[]; gemstones: { gemstoneId: string; caratWeight: number; cut?: string | null; color?: string | null; clarity?: string | null; certificationId?: string | null; }[]; }[];
  variantsToAdd: { sku: string; weight: number; makingCharge: number; wastage?: number | null; quantity: number; materials: { materialId: string; purity: string; weight: number }[]; gemstones: { gemstoneId: string; caratWeight: number; cut?: string | null; color?: string | null; clarity?: string | null; certificationId?: string | null; }[]; }[];
  variantIdsToDelete: string[];
};

// Mock data for dropdowns
const mockCategories = [
  { id: 'cat1', name: 'Rings' },
  { id: 'cat2', name: 'Necklaces' },
  { id: 'cat3', name: 'Earrings' },
  { id: 'cat4', name: 'Bracelets' },
];

const mockBrands = [
  { id: 'brand1', name: 'Luxury Gold' },
  { id: 'brand2', name: 'Diamond Elite' },
  { id: 'brand3', name: 'Silver Craft' },
];

const mockAttributes = [
  { id: 'attr1', name: 'Style' },
  { id: 'attr2', name: 'Occasion' },
  { id: 'attr3', name: 'Gender' },
];

const mockMaterials = [
  { id: 'mat1', name: 'Gold' },
  { id: 'mat2', name: 'Silver' },
  { id: 'mat3', name: 'Platinum' },
];

const mockGemstones = [
  { id: 'gem1', name: 'Diamond' },
  { id: 'gem2', name: 'Ruby' },
  { id: 'gem3', name: 'Emerald' },
  { id: 'gem4', name: 'Sapphire' },
];

const mockCertifications = [
  { id: 'cert1', name: 'GIA' },
  { id: 'cert2', name: 'AGS' },
  { id: 'cert3', name: 'EGL' },
];

// Mock API functions
const fetchProductById = async (id: string): Promise<FullProductPayload> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: id,
    name: 'Diamond Engagement Ring',
    sku: 'RING001',
    description: 'Beautiful diamond engagement ring with intricate design',
    hsnCode: '7113',
    imageUrl: 'https://example.com/ring.jpg',
    categoryId: 'cat1',
    brandId: 'brand2',
    attributes: [
      { attributeId: 'attr1', value: 'Classic' },
      { attributeId: 'attr2', value: 'Wedding' },
    ],
    variants: [
      {
        id: 'var1',
        sku: 'RING001-V1',
        weight: 5.5,
        makingCharge: 2000,
        wastage: 0.1,
        quantity: 10,
        materials: [
          { materialId: 'mat1', purity: '18K', weight: 5.0 },
        ],
        gemstones: [
          {
            gemstoneId: 'gem1',
            caratWeight: 1.0,
            cut: 'Round',
            color: 'D',
            clarity: 'VVS1',
            certificationId: 'cert1',
          },
        ],
      },
      {
        id: 'var2',
        sku: 'RING001-V2',
        weight: 6.0,
        makingCharge: 2200,
        wastage: 0.15,
        quantity: 5,
        materials: [
          { materialId: 'mat3', purity: '95%', weight: 5.5 },
        ],
        gemstones: [
          {
            gemstoneId: 'gem2',
            caratWeight: 0.8,
            cut: 'Princess',
            color: 'Red',
            clarity: 'VS1',
            certificationId: 'cert2',
          },
        ],
      },
    ],
  };
};

const updateProduct = async (id: string, data: UpdateProductPayload): Promise<FullProductPayload> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('Updating product:', id, data);
  
  // Mock successful update
  // Construct a valid FullProductPayload for the mock response
  return {
    id,
    name: data.name ?? 'Updated Product',
    sku: 'UPDATED-SKU', // You may want to keep the original or update as needed
    description: data.description ?? null,
    hsnCode: data.hsnCode ?? null,
    imageUrl: data.imageUrl ?? null,
    categoryId: data.categoryId ?? '',
    brandId: data.brandId ?? null,
    attributes: data.attributes ?? [],
    variants: [
      ...(data.variantsToUpdate ?? []),
      ...(data.variantsToAdd ?? []).map((variant, idx) => ({
        id: `new-${idx}-${Date.now()}`, // Assign a temporary unique id for new variants
        ...variant,
      })),
    ],
  };
};

const deleteProduct = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Deleting product:', id);
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [originalData, setOriginalData] = useState<FullProductPayload | null>(null);

  // Fetch product data
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });

  // Form setup
  const form = useForm<FullProductPayload>({
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      hsnCode: '',
      imageUrl: '',
      categoryId: '',
      brandId: '',
      attributes: [],
      variants: [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
    control: form.control,
    name: 'attributes',
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductPayload) => updateProduct(id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      router.push('/products/product-list');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      router.push('/products/product-list');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  // Populate form when data is fetched
  useEffect(() => {
    if (product) {
      form.reset(product);
      setOriginalData(product);
    }
  }, [product, form]);

  // Handle form submission
  const onSubmit = (data: FullProductPayload) => {
    if (!originalData) return;

    // Separate variants into update, add, and delete categories
    const variantsToUpdate = data.variants.filter(variant => 
      variant.id && originalData.variants.some(orig => orig.id === variant.id)
    );
    
    const variantsToAdd = data.variants.filter(variant => !variant.id);
    
    const payload: UpdateProductPayload = {
      name: data.name !== originalData.name ? data.name : undefined,
      description: data.description !== originalData.description ? data.description : undefined,
      hsnCode: data.hsnCode !== originalData.hsnCode ? data.hsnCode : undefined,
      imageUrl: data.imageUrl !== originalData.imageUrl ? data.imageUrl : undefined,
      categoryId: data.categoryId !== originalData.categoryId ? data.categoryId : undefined,
      brandId: data.brandId !== originalData.brandId ? data.brandId : undefined,
      attributes: JSON.stringify(data.attributes) !== JSON.stringify(originalData.attributes) ? data.attributes : undefined,
      variantsToUpdate,
      variantsToAdd,
      variantIdsToDelete: deletedVariantIds,
    };

    updateMutation.mutate(payload);
  };

  // Handle variant deletion
  const handleDeleteVariant = (index: number) => {
    const variant = variantFields[index];
    if (variant.id) {
      setDeletedVariantIds(prev => [...prev, variant.id]);
    }
    removeVariant(index);
  };

  // Add new variant
  const addNewVariant = () => {
    appendVariant({
      id: '',
      sku: `${form.getValues('sku')}-V${variantFields.length + 1}`,
      weight: 0,
      makingCharge: 0,
      wastage: 0,
      quantity: 0,
      materials: [],
      gemstones: [],
    });
  };

  // Add new attribute
  const addNewAttribute = () => {
    appendAttribute({ attributeId: '', value: '' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>Product not found or an error occurred.</p>
          <Button onClick={() => router.push('/products/product-list')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Product: {product.name}</h1>
        <p className="text-muted-foreground mt-2">Modify product details and variants</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...form.register('name', { required: 'Product name is required' })}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  readOnly
                  {...form.register('sku')}
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                rows={3}
                placeholder="Enter product description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  {...form.register('hsnCode')}
                  placeholder="e.g., 7113"
                />
              </div>
              
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={form.watch('categoryId')}
                  onValueChange={(value) => form.setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="brandId">Brand</Label>
                <Select
                  value={form.watch('brandId') || ''}
                  onValueChange={(value) => form.setValue('brandId', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                {...form.register('imageUrl')}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Product Attributes
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewAttribute}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Attribute
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attributeFields.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No attributes added yet</p>
            ) : (
              <div className="space-y-4">
                {attributeFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Attribute</Label>
                      <Select
                        value={form.watch(`attributes.${index}.attributeId`)}
                        onValueChange={(value) => form.setValue(`attributes.${index}.attributeId`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAttributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.id}>
                              {attr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Value</Label>
                      <Input
                        {...form.register(`attributes.${index}.value`)}
                        placeholder="Enter value"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Product Variants
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewVariant}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {variantFields.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No variants added yet</p>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {variantFields.map((field, variantIndex) => (
                  <AccordionItem key={field.id} value={`variant-${variantIndex}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>
                          Variant {variantIndex + 1}: {form.watch(`variants.${variantIndex}.sku`) || 'New Variant'}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVariant(variantIndex);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <VariantForm
                        form={form}
                        variantIndex={variantIndex}
                        isReadOnlySku={!!field.id}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Product
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product and all its variants.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/products/product-list')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Variant Form Component
function VariantForm({ form, variantIndex, isReadOnlySku }: { 
  form: any; 
  variantIndex: number; 
  isReadOnlySku: boolean; 
}) {
  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.materials`,
  });

  const { fields: gemstoneFields, append: appendGemstone, remove: removeGemstone } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.gemstones`,
  });

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      {/* Basic Variant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>SKU</Label>
          <Input
            {...form.register(`variants.${variantIndex}.sku`)}
            readOnly={isReadOnlySku}
            className={isReadOnlySku ? 'bg-muted' : ''}
          />
        </div>
        <div>
          <Label>Weight (grams)</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register(`variants.${variantIndex}.weight`, { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Making Charge</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register(`variants.${variantIndex}.makingCharge`, { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Wastage (%)</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register(`variants.${variantIndex}.wastage`, { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            {...form.register(`variants.${variantIndex}.quantity`, { valueAsNumber: true })}
          />
        </div>
      </div>

      <Separator />

      {/* Materials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Materials</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendMaterial({ materialId: '', purity: '', weight: 0 })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>
        
        {materialFields.map((field, materialIndex) => (
          <div key={field.id} className="flex gap-4 items-end mb-2">
            <div className="flex-1">
              <Label>Material</Label>
              <Select
                value={form.watch(`variants.${variantIndex}.materials.${materialIndex}.materialId`)}
                onValueChange={(value) => form.setValue(`variants.${variantIndex}.materials.${materialIndex}.materialId`, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {mockMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Purity</Label>
              <Input
                {...form.register(`variants.${variantIndex}.materials.${materialIndex}.purity`)}
                placeholder="e.g., 18K, 95%"
              />
            </div>
            <div className="flex-1">
              <Label>Weight (g)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register(`variants.${variantIndex}.materials.${materialIndex}.weight`, { valueAsNumber: true })}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeMaterial(materialIndex)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      {/* Gemstones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Gemstones</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendGemstone({ 
              gemstoneId: '', 
              caratWeight: 0, 
              cut: '', 
              color: '', 
              clarity: '', 
              certificationId: '' 
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gemstone
          </Button>
        </div>
        
        {gemstoneFields.map((field, gemstoneIndex) => (
          <div key={field.id} className="space-y-4 p-4 border rounded mb-4">
            <div className="flex justify-between items-center">
              <h5 className="font-medium">Gemstone {gemstoneIndex + 1}</h5>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeGemstone(gemstoneIndex)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Gemstone</Label>
                <Select
                  value={form.watch(`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneId`)}
                  onValueChange={(value) => form.setValue(`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneId`, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gemstone" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGemstones.map((gemstone) => (
                      <SelectItem key={gemstone.id} value={gemstone.id}>
                        {gemstone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Carat Weight</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register(`variants.${variantIndex}.gemstones.${gemstoneIndex}.caratWeight`, { valueAsNumber: true })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Cut</Label>
                <Input
                  {...form.register(`variants.${variantIndex}.gemstones.${gemstoneIndex}.cut`)}
                  placeholder="e.g., Round, Princess"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  {...form.register(`variants.${variantIndex}.gemstones.${gemstoneIndex}.color`)}
                  placeholder="e.g., D, E, F"
                />
              </div>
              <div>
                <Label>Clarity</Label>
                <Input
                  {...form.register(`variants.${variantIndex}.gemstones.${gemstoneIndex}.clarity`)}
                  placeholder="e.g., VVS1, VS1"
                />
              </div>
            </div>
            
            <div>
              <Label>Certification</Label>
              <Select
                value={form.watch(`variants.${variantIndex}.gemstones.${gemstoneIndex}.certificationId`) || ''}
                onValueChange={(value) => form.setValue(`variants.${variantIndex}.gemstones.${gemstoneIndex}.certificationId`, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certification" />
                </SelectTrigger>
                <SelectContent>
                  {mockCertifications.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}