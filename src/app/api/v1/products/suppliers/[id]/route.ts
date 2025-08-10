import prisma from '@/lib/db';
import { updateSupplierSchema } from '@/lib/types/products/suppliers';
import { requireAuth } from '@/lib/utils/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
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

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateSupplierSchema.parse(body);
    
    // Check if supplier exists and belongs to user's shop
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check if contact number is being updated and if it conflicts
    if (validatedData.contactNumber && validatedData.contactNumber !== existingSupplier.contactNumber) {
      const contactNumberExists = await prisma.supplier.findUnique({
        where: {
          shopId_contactNumber: {
            shopId: session.user.shopId,
            contactNumber: validatedData.contactNumber,
          },
        },
      });

      if (contactNumberExists) {
        return NextResponse.json(
          { error: 'Supplier with this contact number already exists' },
          { status: 409 }
        );
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            inventory: true,
            purchases: true,
          },
        },
      },
    });

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Error updating supplier:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check if supplier exists and belongs to user's shop
    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
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

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check if supplier has inventory items or purchases
    if (supplier._count.inventory > 0 || supplier._count.purchases > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with existing inventory or purchases' },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}