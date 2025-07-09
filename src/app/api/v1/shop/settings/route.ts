// app/api/shop/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { requireAuth } from '@/lib/utils/auth-utils';

const updateSettingsSchema = z.object({
  defaultMakingChargeType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  defaultMakingChargeValue: z.number().min(0).optional(),
  gstGoldRate: z.number().min(0).max(100).optional(),
  gstMakingRate: z.number().min(0).max(100).optional(),
  primaryLanguage: z.string().optional(),
  billingPrefix: z.string().optional(),
  invoiceTemplateId: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);
    
    // In a real app, get shopId from user session/auth
    const shopId = session.user.shopId;

    if (!session.user?.shopId) {
        return NextResponse.json(
            { message: 'No shopId for this user' },
            { status: 401 }
        );
    }

    // First, check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { settings: true },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Update or create settings
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        settings: {
          upsert: {
            create: {
              ...validatedData,
            },
            update: validatedData,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return NextResponse.json(updatedShop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}