import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';

export async function DELETE(request: NextRequest) {
  try {
    const session = await requirePermission('DELETE_INVENTORY');
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: ids array is required' },
        { status: 400 }
      );
    }

    // Validate that all items exist and belong to user's shop
    const items = await prisma.inventoryItem.findMany({
      where: {
        id: { in: ids },
        shopId: session.user.shopId,
      },
      include: {
        saleItems: true,
        stockAdjustments: true,
      },
    });

    if (items.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more inventory items not found' },
        { status: 404 }
      );
    }

    // Check if any items have been sold
    const soldItems = items.filter(item => item.saleItems.length > 0);
    if (soldItems.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete items that have been sold',
          soldItems: soldItems.map(item => ({ id: item.id, name: item.name }))
        },
        { status: 400 }
      );
    }

    // Check if any items have stock adjustments
    const itemsWithAdjustments = items.filter(item => item.stockAdjustments.length > 0);
    if (itemsWithAdjustments.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete items with stock adjustment history',
          itemsWithAdjustments: itemsWithAdjustments.map(item => ({ id: item.id, name: item.name }))
        },
        { status: 400 }
      );
    }

    // Perform bulk delete
    const deleteResult = await prisma.inventoryItem.deleteMany({
      where: {
        id: { in: ids },
        shopId: session.user.shopId,
      },
    });

    return NextResponse.json({
      message: `${deleteResult.count} inventory items deleted successfully`,
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory items' },
      { status: 500 }
    );
  }
}
