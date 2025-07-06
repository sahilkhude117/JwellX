import { NextRequest, NextResponse } from "next/server";
import { verifyEmailSchema } from "@/lib/validations/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: validatedData.token,
        emailVerified: false
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "EMAIL_VERIFIED",
        entityType: "User",
        entityId: user.id,
        description: `Email verified for ${user.email}`,
        userId: user.id,
      }
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid verification token" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}