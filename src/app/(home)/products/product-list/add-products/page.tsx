
'use client';

import Attributes from "@/app/components/products/add-products/Attributes";
import ContextualSetupBar from "@/app/components/products/add-products/ConceptualSetupBar";
import ProductDetails from "@/app/components/products/add-products/ProductDetails";
import Summary from "@/app/components/products/add-products/Summary";
import Variants from "@/app/components/products/add-products/variants/Variants";
import { Button } from "@/components/ui/button";
import { useCreateProduct } from "@/hooks/products/use-products";
import { CreateProductFormData, createProductSchema } from "@/lib/types/products/create-products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const createProductMutation = useCreateProduct();

  const methods = useForm<CreateProductFormData>({
    //@ts-ignore
    resolver: zodResolver(createProductSchema.omit({
      categoryId: true,
      brandId: true,
      variants: true,
    }).extend({
      category: createProductSchema.shape.categoryId,
      brand: createProductSchema.shape.brandId.optional(),
      variants: createProductSchema.shape.variants
    })),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: '',
      brand: '',
      hsnCode: '',
      imageUrls: [],
      attributes: [],
      variants: [{
        id: generateId(),
        sku: '',
        totalWeight: 0,
        makingCharge: 0,
        wastage: 0,
        quantity: 1,
        materials: [{
          id: generateId(),
          materialId: '',
          purity: '',
          weight: 0,
          rate: 0,
        }],
        gemstones: [],
      }]
    },
    mode: 'onChange'
  })

  const { handleSubmit, watch, formState: { errors } } = methods;

  const watchedValues = watch();

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      setIsSubmitting(true);

      const transformedData = {
        name: data.name,
        sku: data.sku,
        description: data.description || undefined,
        hsnCode: data.hsnCode || undefined,
        categoryId: data.category,
        brandId: data.brand || undefined,
        imageUrls: data.imageUrls,
        attributes: data.attributes.map(attr => ({
          name: attr.name,
          value: attr.value,
        })),
        variants: data.variants.map(variant => ({
          sku: variant.sku,
          totalWeight: Number(variant.totalWeight),
          makingCharge: Number(variant.makingCharge),
          wastage: variant.wastage ? Number(variant.wastage) : undefined,
          quantity: Number(variant.quantity),
          materials: variant.materials.map(material => ({
            materialId: material.materialId,
            purity: material.purity,
            weight: Number(material.weight),
            rate: Number(material.rate),
          })),
          gemstones: variant.gemstones.map(gemstone => ({
            gemstoneId: gemstone.gemstoneId,
            caratWeight: Number(gemstone.caratWeight),
            cut: gemstone.cut || undefined,
            color: gemstone.color || undefined,
            clarity: gemstone.clarity || undefined,
            certificationId: gemstone.certificationId || undefined,
            rate: Number(gemstone.rate),
          })),
        })),
      };

      await createProductMutation.mutateAsync(transformedData);

      methods.reset();
      router.push('/products/product-list')
    } catch(error: any) {
      console.error('Error creating product:', error);
      
      // Handle validation errors from backend
      if (error?.response?.data?.validationErrors) {
        const validationErrors = error.response.data.validationErrors;
        validationErrors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(error?.response?.data?.error || 'Failed to create product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto p-6 max-w-7xl">
        <h1 className="text-2xl font-bold mb-2">Add New Product</h1>
        <p className="text-muted-foreground mb-8">
          Create jewelry products with precise material and gemstone specifications
        </p>
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <ContextualSetupBar /> 
          <ProductDetails />
          <Attributes />
          <Variants />

          {/* Action Buttons  */}
          <div className="flex justify-end gap-3 pt-4 bordet-t">
            <Button
              type="button" 
              variant="outline"
              onClick={() => methods.reset()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="px-8"
              disabled={isSubmitting || createProductMutation.isPending}
            >
              {isSubmitting || createProductMutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </div>

          <Summary />
        </form>
      </div>
    </FormProvider>
  )
}





