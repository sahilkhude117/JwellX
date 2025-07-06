import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validations/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = resetPasswordSchema.parse(body);

        // find user by reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: validatedData.token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { message: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "PASSWORD_RESET_COMPLETED",
                entityType: "User",
                entityId: user.id,
                description: `Password reset completed for ${user.email}`,
                userId: user.id,
            }
        });

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);

        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { message: "Invalid input data" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}