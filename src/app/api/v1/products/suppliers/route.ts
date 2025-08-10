import prisma from "@/lib/db";
import { createSupplierSchema } from "@/lib/types/products/suppliers";
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
                    { contactNumber: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { address: { contains: search, mode: 'insensitive' as const } },
                    { gstin: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [suppliers, total] = await Promise.all([
            prisma.supplier.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            inventory: true,
                            purchases: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.supplier.count({ where }),
        ]);

        return NextResponse.json({
            suppliers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();

        const validatedData = createSupplierSchema.parse(body);

        const existingSupplier = await prisma.supplier.findUnique({
            where: {
                shopId_contactNumber: {
                    shopId: session.user.shopId,
                    contactNumber: validatedData.contactNumber,
                },
            },
        });

        if (existingSupplier) {
            return NextResponse.json(
                { error: 'Supplier with this contact number already exists' },
                { status: 409 }
            );
        }

        const supplier = await prisma.supplier.create({
            data: {
                ...validatedData,
                shopId: session.user.shopId,
            },
            include: {
                _count: {
                    select: {
                        inventory: true,
                        purchases: true,
                    },
                },
            },
        });

        return NextResponse.json({ supplier }, { status: 201 });
    } catch (error) {
        console.error('Error creating supplier:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create supplier' },
            { status: 500 }
        );
    }
}