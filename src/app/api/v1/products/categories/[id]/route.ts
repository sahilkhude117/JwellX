// src/app/api/v1/categories/[id]/route.ts
import prisma from '@/lib/db';
import { updateCategorySchema } from '@/lib/types/products/categories';
import { requireAuth } from '@/lib/utils/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const category = await prisma.category.findFirst({
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

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
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
    
    const validatedData = updateCategorySchema.parse(body);
    
    // Check if category exists and belongs to user's shop
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if code is being updated and if it conflicts
    if (validatedData.code && validatedData.code !== existingCategory.code) {
      const codeExists = await prisma.category.findUnique({
        where: {
          shopId_code: {
            shopId: session.user.shopId,
            code: validatedData.code,
          },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Category code already exists' },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
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

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
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

    // Check if category exists and belongs to user's shop
    const category = await prisma.category.findFirst({
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

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}