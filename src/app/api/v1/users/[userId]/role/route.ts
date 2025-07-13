import prisma from "@/lib/db";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requirePermission('EDIT_USER');

    const body = await request.json();
    const { role } = z.object({
      role: z.enum(['OWNER', 'SALES_STAFF', 'ARTISAN', 'ACCOUNTANT']),
    }).parse(body);

    const user = await prisma.user.findFirst({
      where: {
        id: params.userId,
        shopId: session.user.shopId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing own role
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}