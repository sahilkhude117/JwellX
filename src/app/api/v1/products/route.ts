import prisma from "@/lib/db";
import { productFilterSchema } from "@/lib/types/products/products";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

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