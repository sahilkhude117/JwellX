import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/utils/auth-utils";
import { createInventoryItemSchema } from "@/lib/types/inventory/inventory";
import { z }from 'zod';

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_INVENTORY');
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId') || '';
        const brandId = searchParams.get('brandId') || '';
        const supplierId = searchParams.get('supplierId') || '';
        const status = searchParams.get('status') || '';
        const isRawMaterial = searchParams.get('isRawMaterial');
        const minWeight = searchParams.get('minWeight');
        const maxWeight = searchParams.get('maxWeight');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        const skip = (page - 1) * limit;

        const where: any = {
            shopId: session.user.shopId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { huid: { contains: search, mode: 'insensitive' } },
            ];
        }

        // filters
        if (categoryId) where.categoryId = categoryId;
        if (brandId) where.brandId = brandId;
        if (supplierId) where.supplierId = supplierId;
        if (status) where.status = status;
        if (isRawMaterial !== null) where.isRawMaterial = isRawMaterial === 'true';

        // Weight range
        if (minWeight || maxWeight) {
            where.grossWeight = {};
            if (minWeight) where.grossWeight.gte = parseFloat(minWeight);
            if (maxWeight) where.grossWeight.lte = parseFloat(maxWeight);
        }
        
        // Price range
        if (minPrice || maxPrice) {
            where.sellingPrice = {};
            if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
            if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
        }

        const [items, total] = await Promise.all([
            prisma.inventoryItem.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    brand: { select: { id: true, name: true } },
                    supplier: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                    updatedBy: { select: { id: true, name: true } },
                    materials: {
                        include: {
                            material: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true,
                                    purity: true,
                                    defaultRate: true,
                                    unit: true,
                                },
                            },
                        },
                    },
                    gemstones: {
                        include: {
                            gemstone: {
                                select: {
                                    id: true,
                                    name: true,
                                    shape: true,
                                    clarity: true,
                                    color: true,
                                    defaultRate: true,
                                    unit: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.inventoryItem.count({ where }),
        ]);

        return NextResponse.json({
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error fetching inventory items: ', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventory items' },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('CREATE_INVENTORY');
        const body = await request.json();

        const validatedData = createInventoryItemSchema.parse(body);

        // check if sku already exists for this shop
        const existingSku = await prisma.inventoryItem.findFirst({
            where: {
                sku: validatedData.sku,
                shopId: session.user.shopId,
            },
        });

        if (existingSku) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 409 }
            );
        }

        // Check if category exists and belongs to shop
        const category = await prisma.category.findFirst({
            where: {
                id: validatedData.categoryId,
                shopId: session.user.shopId,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

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
                    { status: 404 }
                );
            }
        }

        if (validatedData.supplierId) {
            const supplier = await prisma.supplier.findFirst({
                where: {
                    id: validatedData.supplierId,
                    shopId: session.user.shopId,
                },
            });

            if (!supplier) {
                return NextResponse.json(
                    { error: 'Supplier not found' },
                    { status: 404 }
                );
            }
        }

        const materialIds = validatedData.materials.map(m => m.materialId);
        const materials = await prisma.material.findMany({
            where: {
                id: { in: materialIds },
                shopId: session.user.shopId,
            },
        });

        if (materials.length !== materialIds.length) {
            return NextResponse.json(
                { error: 'One or more materials not found' },
                { status: 404 }
            );
        }

        if (validatedData.gemstones && validatedData.gemstones.length > 0) {
            const gemstoneIds = validatedData.gemstones.map(g => g.gemstoneId);
            const gemstones = await prisma.gemstone.findMany({
                where: {
                    id: { in: gemstoneIds },
                    shopId: session.user.shopId,
                },
            });

            if (gemstones.length !== gemstoneIds.length) {
                return NextResponse.json(
                    { error: 'One or more gemstones not found' },
                    { status: 404 }
                );
            }
        }

        const item = await prisma.inventoryItem.create({
            data: {
                name: validatedData.name,
                sku: validatedData.sku,
                description: validatedData.description,
                hsnCode: validatedData.hsnCode,
                huid: validatedData.huid,
                grossWeight: validatedData.grossWeight,
                wastage: validatedData.wastage,
                quantity: validatedData.quantity,
                location: validatedData.location,
                sellingPrice: validatedData.sellingPrice,
                isRawMaterial: validatedData.isRawMaterial,
                status: validatedData.status,
                gender: validatedData.gender,
                occasion: validatedData.occasion,
                style: validatedData.style,
                makingChargeType: validatedData.makingChargeType,
                makingChargeValue: validatedData.makingChargeValue,
                shopId: session.user.shopId,
                categoryId: validatedData.categoryId,
                brandId: validatedData.brandId,
                supplierId: validatedData.supplierId,
                createdById: session.user.id,
                updatedById: session.user.id,
                materials: {
                    create: validatedData.materials.map(material => ({
                        materialId: material.materialId,
                        weight: material.weight,
                        buyingPrice: material.buyingPrice,
                    })),
                },
                ...(validatedData.gemstones && {
                    gemstones: {
                        create: validatedData.gemstones.map(gemstone => ({
                            gemstoneId: gemstone.gemstoneId,
                            weight: gemstone.weight,
                            buyingPrice: gemstone.buyingPrice,
                        })),
                    },
                }),
            },
            include: {
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                supplier: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
                updatedBy: { select: { id: true, name: true } },
                materials: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                purity: true,
                                defaultRate: true,
                                unit: true,
                            },
                        },
                    },
                },
                gemstones: {
                    include: {
                        gemstone: {
                            select: {
                                id: true,
                                name: true,
                                shape: true,
                                clarity: true,
                                color: true,
                                defaultRate: true,
                                unit: true,
                            },
                        },
                    },
                },
            }
        });

        return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
        console.error('Error creating inventory item:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create inventory item' },
            { status: 500 }
        );
    }
}