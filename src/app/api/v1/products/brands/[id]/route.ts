import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/utils/auth-utils';
import { updateBrandSchema } from '@/lib/types/products/categories';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const brand = await prisma.brand.findFirst({
      where: {
        id,
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

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
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
    const { id } = params;
    const body = await request.json();
    
    const validatedData = updateBrandSchema.parse(body);
    
    // Check if brand exists and belongs to user's shop
    const existingBrand = await prisma.brand.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if name is being updated and if it conflicts
    if (validatedData.name && validatedData.name !== existingBrand.name) {
      const nameExists = await prisma.brand.findUnique({
        where: {
          shopId_name: {
            shopId: session.user.shopId,
            name: validatedData.name,
          },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Brand name already exists' },
          { status: 409 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Error updating brand:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update brand' },
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
    const { id } = params;

    // Check if brand exists and belongs to user's shop
    const brand = await prisma.brand.findFirst({
      where: {
        id,
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

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if brand has products
    if (brand._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing products' },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}