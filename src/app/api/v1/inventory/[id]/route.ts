
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { updateInventoryItemSchema } from '@/lib/types/inventory/inventory';
import { z } from 'zod';
import { requirePermission } from '@/lib/utils/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('VIEW_INVENTORY');
    const { id } = await params;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
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
        stockAdjustments: {
          include: {
            adjustedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 adjustments
        },
        saleItems: {
          include: {
            sale: {
              select: {
                id: true,
                billNumber: true,
                saleDate: true,
                totalAmount: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('EDIT_INVENTORY');
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateInventoryItemSchema.parse(body);
    
    // Check if item exists and belongs to user's shop
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        materials: true,
        gemstones: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if SKU is being updated and if it conflicts
    if (validatedData.sku && validatedData.sku !== existingItem.sku) {
      const skuExists = await prisma.inventoryItem.findFirst({
        where: {
          sku: validatedData.sku,
          shopId: session.user.shopId,
          id: { not: id },
        },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Validate category if provided
    if (validatedData.categoryId) {
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
    }

    // Validate brand if provided
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

    // Validate supplier if provided
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

    // Prepare update data - include all validated fields
    const updateData: any = {
      ...validatedData,
      updatedById: session.user.id,
    };

    // Handle materials update if provided
    if (validatedData.materials) {
      // Validate materials exist and belong to shop
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

      updateData.materials = {
        deleteMany: {}, // Delete existing materials
        create: validatedData.materials.map(material => ({
          materialId: material.materialId,
          weight: material.weight,
          buyingPrice: material.buyingPrice,
        })),
      };
    }

    // Handle gemstones update if provided
    if (validatedData.gemstones) {
      if (validatedData.gemstones.length > 0) {
        // Validate gemstones exist and belong to shop
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

        updateData.gemstones = {
          deleteMany: {}, // Delete existing gemstones
          create: validatedData.gemstones.map(gemstone => ({
            gemstoneId: gemstone.gemstoneId,
            weight: gemstone.weight,
            buyingPrice: gemstone.buyingPrice,
          })),
        };
      } else {
        updateData.gemstones = {
          deleteMany: {}, // Delete all existing gemstones
        };
      }
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('DELETE_INVENTORY');
    const { id } = await params;

    // Check if item exists and belongs to user's shop
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        saleItems: true,
        stockAdjustments: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if item has been sold
    if (item.saleItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item that has been sold' },
        { status: 400 }
      );
    }

    // Check if item has stock adjustments
    if (item.stockAdjustments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item with stock adjustment history' },
        { status: 400 }
      );
    }

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
