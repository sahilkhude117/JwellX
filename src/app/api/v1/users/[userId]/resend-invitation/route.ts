import prisma from "@/lib/db";
import { sendInvitationEmail } from "@/lib/email/user-invitation";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requirePermission('CREATE_USER');

    const user = await prisma.user.findFirst({
      where: {
        id: params.userId,
        shopId: session.user.shopId,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'User has already verified their email' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Resend invitation email
    try {
        await sendInvitationEmail({
            email: user.email!,
            name: user.name,
            shopName: user.shop.name,
            inviterName: session.user.name,
            verificationToken,
        });

        return NextResponse.json({
            message: 'Invitation resent successfully',
        });
    } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        return NextResponse.json({
            message: 'Verification token updated, but failed to send invitation email.',
            userId: user.id,
            warning: true,
        }, { status: 202 });
    }
    } catch (error) {
        console.error('Error resending invitation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
  }
}