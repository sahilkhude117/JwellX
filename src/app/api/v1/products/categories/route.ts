import prisma from "@/lib/db";
import { createCategorySchema } from "@/lib/types/products/categories";
import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = {
            shopId: session.user.shopId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            products: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.category.count({ where }),
        ]);

        return NextResponse.json({
            categories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();

        const validatedData = createCategorySchema.parse(body);

        const existingCategory = await prisma.category.findUnique({
            where: {
                shopId_name: {
                    shopId: session.user.shopId,
                    name: validatedData.name,
                },
            },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category Name already exists' },
                { status: 409 }
            );
        }

        const category = await prisma.category.create({
            data: {
                ...validatedData,
                shopId: session.user.shopId,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        
        if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: 'Validation error', details: error.errors },
            { status: 400 }
        );
        }
        
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}