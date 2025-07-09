import prisma from "@/lib/db";
import { requireRole } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const shopOnboardingSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Valid email is required'),
  contactNumber: z.string().min(10, 'Valid contact number is required'),
  gstin: z.string().optional(),
  logoUrl: z.string().optional(),
  billingPrefix: z.string().min(1, 'Billing prefix is required').default('INV'),
  invoiceTemplateId: z.string().min(1, 'Invoice template is required'),
});

export async function POST (request: NextRequest) {
  try {
    const session = await requireRole('OWNER')

    if (!session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = shopOnboardingSchema.parse(body)

    // check if user has already completed onboarding
    const user = await prisma.user.findUnique({
      where: { id: session.user.id, role: 'OWNER' },
      include: { shop: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'user not found' },
        { status: 404 }
      );
    }

    if (user.hasCompletedOnboarding) {
      return NextResponse.json(
        { message: 'Onboarding already completed' },
        { status: 400 }
      );
    }

    if (!user.shopId) {
      return NextResponse.json(
        { message: 'Shop not found for user' },
        { status: 400 }
      );
    }

    // update shop and shop settings
    const updatedShop = await prisma.shop.update({
      where: { id: user.shopId },
      data: {
        name: validatedData.shopName,
        address: validatedData.address,
        email: validatedData.email,
        contactNumber: validatedData.contactNumber,
        gstin: validatedData.gstin,
        logoUrl: validatedData.logoUrl,
        settings: {
          upsert: {
            create: {
              billingPrefix: validatedData.billingPrefix,
              invoiceTemplateId: validatedData.invoiceTemplateId,
            },
            update: {
              billingPrefix: validatedData.billingPrefix,
              invoiceTemplateId: validatedData.invoiceTemplateId
            }
          }
        }
      },
      include: { settings: true }
    });

    // Mark user as having completed onboarding
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompletedOnboarding: true }
    })

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      shop: updatedShop
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}