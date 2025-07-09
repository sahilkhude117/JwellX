import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { requireAuth } from '@/lib/utils/auth-utils';

const updateShopSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const shopId = session.user.shopId;

        if (!session.user?.shopId) {
            return NextResponse.json(
                { message: 'No shopId for this user' },
                { status: 401 }
            );
        }

        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                settings: true,
            }
        })

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        return NextResponse.json(shop);
    } catch (error) {
        console.error('Get shop error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validatedData = updateShopSchema.parse(body);
    
    // In a real app, get shopId from user session/auth
    const shopId = session.user.shopId

    if (!session.user?.shopId) {
        return NextResponse.json(
            { message: 'No shopId for this user' },
            { status: 401 }
        );
    }

    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: validatedData,
      include: {
        settings: true,
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Update shop error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}