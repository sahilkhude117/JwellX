import { z } from "zod";
import { brandSchema, categorySchema } from "./categories";
import { gemstoneSchema, materialSchema, variantGemstoneSchema, variantMaterialSchema } from "./materials";

export const productDataRowSchema = z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    imageUrl: z.string().nullable(),
    category: categorySchema,
    brand: brandSchema.nullable(),
    _count: z.object({
        variants: z.number().int().min(0),
    }),
    totalStock: z.number().int().min(0),
    status: z.enum(['active', 'inactive', 'discontinued']),
});

export const productListResponseSchema = z.object({
    products: z.array(productDataRowSchema),
    totalCount: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
})

export const productFilterSchema = z.object({
    q: z.string().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const variantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  totalWeight: z.number().min(0),
  makingCharge: z.number().min(0),
  wastage: z.number().min(0).optional(),
  quantity: z.number().int().min(0),
  materials: z.array(variantMaterialSchema),
  gemstones: z.array(variantGemstoneSchema),
});

export const productDetailSchema = z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    description: z.string().nullable(),
    hsnCode: z.string().nullable(),
    imageUrls: z.array(z.string()).nullable(),
    category: categorySchema,
    brand: brandSchema.nullable(),
    attributes: z.array(z.object({
        name: z.string(),
        value: z.string(),
    })),
    variants: z.array(variantSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
})


// export type Category = z.infer<typeof categorySchema>;
// export type Brand = z.infer<typeof brandSchema>;
export type ProductDataRow = z.infer<typeof productDataRowSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
export type ProductFilters = z.infer<typeof productFilterSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type Variant = z.infer<typeof variantSchema>;
// export type Material = z.infer<typeof materialSchema>;
// export type Gemstone = z.infer<typeof gemstoneSchema>;