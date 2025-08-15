import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, requirePermission } from '@/lib/utils/auth-utils';
import { createStockAdjustmentSchema } from '@/lib/types/inventory/inventory';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('EDIT_INVENTORY')
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const inventoryItemId = searchParams.get('inventoryItemId') || '';
    const userId = searchParams.get('userId') || '';
    const startDate = searchParams.get('startDate'); 
    const endDate = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      shopId: session.user.shopId,
    };

    // Filters
    if (inventoryItemId) where.inventoryItemId = inventoryItemId;
    if (userId) where.userId = userId;
    
    // Date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        skip,
        take: limit,
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          adjustedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.stockAdjustment.count({ where }),
    ]);

    return NextResponse.json({
      adjustments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching stock adjustments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock adjustments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    
    const validatedData = createStockAdjustmentSchema.parse(body);
    
    // Check if inventory item exists and belongs to user's shop
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: validatedData.inventoryItemId,
        shopId: session.user.shopId,
      },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if adjustment would result in negative quantity
    const newQuantity = inventoryItem.quantity + validatedData.adjustment;
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Adjustment would result in negative quantity' },
        { status: 400 }
      );
    }

    // Create stock adjustment and update inventory item in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the stock adjustment
      const adjustment = await tx.stockAdjustment.create({
        data: {
          inventoryItemId: validatedData.inventoryItemId,
          adjustment: validatedData.adjustment,
          reason: validatedData.reason,
          userId: session.user.id,
          shopId: session.user.shopId,
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          adjustedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update the inventory item quantity
      await tx.inventoryItem.update({
        where: { id: validatedData.inventoryItemId },
        data: {
          quantity: newQuantity,
          updatedById: session.user.id,
        },
      });

      return adjustment;
    });

    return NextResponse.json({ adjustment: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock adjustment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create stock adjustment' },
      { status: 500 }
    );
  }
}