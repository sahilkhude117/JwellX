import prisma from "@/lib/db";
import { CreateProductResponse, createProductSchema } from "@/lib/types/products/create-products";
import { productFilterSchema } from "@/lib/types/products/products";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_INVENTORY');

        const { searchParams } = new URL(request.url);
        const validatedFilters = productFilterSchema.parse({
            q: searchParams.get('q') || undefined,
            categoryId: searchParams.get('categoryId') || undefined,
            brandId: searchParams.get('brandId') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
        });

        const { q, categoryId, brandId, page, limit } = validatedFilters;
        const skip = (page - 1) * limit;

        const where = {
            shopId: session.user.shopId,
            ...(q && {
                OR: [
                    { name: { contains: q, mode: 'insensitive' as const } },
                    { sku: { contains: q, mode: 'insensitive' as const } },
                ],
            }),
            ...(categoryId && { categoryId }),
            ...(brandId && { brandId }),
        };

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: {
                        select: { id: true, name: true, description: true },
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    },
                    _count : {
                        select: { variants: true },
                    },
                    variants: {
                        select: { quantity: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        const productsWithStock = products.map(product => ({
            ...product,
            totalStock: product.variants.reduce((sum, v) => sum + v.quantity, 0),
            status: product.variants.some(v => v.quantity > 0) ? 'active' : 'inactive',
        }));

        return NextResponse.json({
            products: productsWithStock,
            totalCount,
            page,
            limit,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('CREATE_INVENTORY');
        const body = await request.json();

        // Validate input
        const validatedData = createProductSchema.parse(body);

        // Check if SKU already exists
        const existingProduct = await prisma.product.findFirst({
            where: {
                shopId: session.user.shopId,
                sku: validatedData.sku,
            },
        });

        if (existingProduct) {
            return NextResponse.json(
                { error: 'Product with this SKU already exists' },
                { status: 400 }
            );
        }

        // Check if variant SKUs are unique
        const variantSkus = validatedData.variants.map(v => v.sku);
        const duplicateSkus = variantSkus.filter((sku, index) => variantSkus.indexOf(sku) !== index);
        
        if (duplicateSkus.length > 0) {
            return NextResponse.json(
                { error: `Duplicate variant SKUs found: ${duplicateSkus.join(', ')}` },
                { status: 400 }
            );
        }

        // Check if any variant SKU already exists
        const existingVariants = await prisma.variant.findMany({
            where: {
                sku: { in: variantSkus },
            },
        });

        if (existingVariants.length > 0) {
            const existingSkus = existingVariants.map(v => v.sku);
            return NextResponse.json(
                { error: `Variant SKUs already exist: ${existingSkus.join(', ')}` },
                { status: 400 }
            );
        }

        // Verify category exists
        const category = await prisma.category.findFirst({
            where: {
                id: validatedData.categoryId,
                shopId: session.user.shopId,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 400 }
            );
        }

        // Verify brand exists (if provided)
        if (validatedData.brandId) {
            const brand = await prisma.brand.findFirst({
                where: {
                    id: validatedData.brandId,
                    shopId: session.user.shopId,
                },
            });

            if (!brand) {
                return NextResponse.json(
                    { error: 'Brand not found' },
                    { status: 400 }
                );
            }
        }

        // Verify materials exist
        const materialIds = validatedData.variants.flatMap(v => v.materials.map(m => m.materialId));
        const uniqueMaterialIds = [...new Set(materialIds)];
        
        const materials = await prisma.material.findMany({
            where: {
                id: { in: uniqueMaterialIds },
                shopId: session.user.shopId,
            },
        });

        if (materials.length !== uniqueMaterialIds.length) {
            const foundIds = materials.map(m => m.id);
            const missingIds = uniqueMaterialIds.filter(id => !foundIds.includes(id));
            return NextResponse.json(
                { error: `Materials not found: ${missingIds.join(', ')}` },
                { status: 400 }
            );
        }

        // Verify gemstones exist (if any)
        const gemstoneIds = validatedData.variants.flatMap(v => v.gemstones.map(g => g.gemstoneId));
        const uniqueGemstoneIds = [...new Set(gemstoneIds)];
        
        if (uniqueGemstoneIds.length > 0) {
            const gemstones = await prisma.gemstone.findMany({
                where: {
                    id: { in: uniqueGemstoneIds },
                    shopId: session.user.shopId,
                },
            });

            if (gemstones.length !== uniqueGemstoneIds.length) {
                const foundIds = gemstones.map(g => g.id);
                const missingIds = uniqueGemstoneIds.filter(id => !foundIds.includes(id));
                return NextResponse.json(
                    { error: `Gemstones not found: ${missingIds.join(', ')}` },
                    { status: 400 }
                );
            }
        }

        // Create product with variants in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create product
            const product = await tx.product.create({
                data: {
                    name: validatedData.name,
                    sku: validatedData.sku,
                    description: validatedData.description || null,
                    hsnCode: validatedData.hsnCode || null,
                    imageUrls: validatedData.imageUrls,
                    categoryId: validatedData.categoryId,
                    brandId: validatedData.brandId || null,
                    shopId: session.user.shopId,
                    attributes: {
                        create: validatedData.attributes.map(attr => ({
                            name: attr.name,
                            value: attr.value,
                        })),
                    },
                },
            });

            // Create variants
            for (const variantData of validatedData.variants) {
                const variant = await tx.variant.create({
                    data: {
                        productId: product.id,
                        sku: variantData.sku,
                        totalWeight: variantData.totalWeight,
                        makingCharge: variantData.makingCharge,
                        wastage: variantData.wastage || null,
                        quantity: variantData.quantity,
                    },
                });

                // Create variant materials
                for (const materialData of variantData.materials) {
                    await tx.variantMaterial.create({
                        data: {
                            variantId: variant.id,
                            materialId: materialData.materialId,
                            purity: materialData.purity,
                            weight: materialData.weight,
                            rate: materialData.rate,
                        },
                    });
                }

                // Create variant gemstones
                for (const gemstoneData of variantData.gemstones) {
                    await tx.variantGemstone.create({
                        data: {
                            variantId: variant.id,
                            gemstoneId: gemstoneData.gemstoneId,
                            caratWeight: gemstoneData.caratWeight,
                            cut: gemstoneData.cut || null,
                            color: gemstoneData.color || null,
                            clarity: gemstoneData.clarity || null,
                            certificationId: gemstoneData.certificationId || null,
                            rate: gemstoneData.rate,
                        },
                    });
                }
            }

            return product;
        });

        const response: CreateProductResponse = {
            id: result.id,
            name: result.name,
            sku: result.sku,
            message: 'Product created successfully',
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { 
                    error: 'Validation failed',
                    validationErrors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}