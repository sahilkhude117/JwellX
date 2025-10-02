import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { updateSaleSchema } from '@/lib/validations/sales';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requirePermission('VIEW_SALES');
    const { id } = params;

    const sale = await prisma.sale.findFirst({
      where: {
        id,
        shopId: session.user.shopId
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
            address: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                huid: true,
                grossWeight: true,
                sellingPrice: true,
                makingChargeType: true,
                makingChargeValue: true,
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                materials: {
                  include: {
                    material: {
                      select: {
                        id: true,
                        name: true,
                        type: true,
                        purity: true,
                        unit: true
                      }
                    }
                  }
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
                        unit: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sale });

  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requirePermission('EDIT_SALE');
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateSaleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if sale exists and belongs to shop
    const existingSale = await prisma.sale.findFirst({
      where: {
        id,
        shopId: session.user.shopId
      }
    });

    if (!existingSale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Check if sale can be edited (business logic)
    if (existingSale.paymentStatus === 'COMPLETED' && updateData.status !== 'RETURNED') {
      return NextResponse.json(
        { error: 'Cannot edit completed sale' },
        { status: 400 }
      );
    }

    // Update sale
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({ sale: updatedSale });

  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Failed to update sale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requirePermission('DELETE_SALE');
    const { id } = params;

    // Check if sale exists and belongs to shop
    const existingSale = await prisma.sale.findFirst({
      where: {
        id,
        shopId: session.user.shopId
      },
      include: {
        items: true
      }
    });

    if (!existingSale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Check if sale can be deleted (business logic)
    if (existingSale.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed sale. Create a return instead.' },
        { status: 400 }
      );
    }

    // Delete sale and restore inventory in transaction
    await prisma.$transaction(async (tx) => {
      // Restore inventory quantities
      for (const item of existingSale.items) {
        await tx.inventoryItem.update({
          where: { id: item.itemId },
          data: { quantity: { increment: 1 } } // Assuming quantity was 1, this should be more sophisticated
        });
      }

      // Delete sale items first (due to foreign key constraints)
      await tx.saleItem.deleteMany({
        where: { saleId: id }
      });

      // Delete sale
      await tx.sale.delete({
        where: { id }
      });
    });

    return NextResponse.json({ message: 'Sale deleted successfully' });

  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
}