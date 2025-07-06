import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import prisma from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/utils/tokens";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, you will receive a password reset email." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    // Send password reset email
    await sendPasswordResetEmail(
      user.email ?? "",
      user.name ?? "",
      resetToken
    );

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "User",
        entityId: user.id,
        description: `Password reset requested for ${user.email}`,
        userId: user.id,
      }
    });

    return NextResponse.json(
      { message: "If an account with that email exists, you will receive a password reset email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}