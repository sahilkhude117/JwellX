import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/send-verification";
import { generateVerificationToken } from "@/lib/utils/tokens";
import { signUpSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = signUpSchema.parse(body);

        // check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: validatedData.username },
                    { email: validatedData.email }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                {
                    message: existingUser.username === validatedData.username
                        ? "Username already exists"
                        : "Email alredy exists"
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        const verificationToken = generateVerificationToken();

        const result = await prisma.$transaction(async (tx) => {
            // create shop first
            const shop = await tx.shop.create({
                data: {
                    name: validatedData.shopName,
                    active: true,
                }
            });

            const user = await tx.user.create({
                data: {
                    username: validatedData.username,
                    email: validatedData.email,
                    name: validatedData.name,
                    password: hashedPassword,
                    role: UserRole.OWNER,
                    shopId: shop.id,
                    active: true,
                    emailVerified: false,
                    verificationToken,
                }
            });

            await tx.auditLog.create({
                data: {
                    action: "USER_CREATED",
                    entityType: "User",
                    entityId: user.id,
                    description: `User ${user.username} created account`,
                    userId: user.id,
                }
            });

            return { user, shop };
        });

        await sendVerificationEmail(
            validatedData.email,
            validatedData.name,
            verificationToken
        )

        return NextResponse.json(
            { message: "Account created successfully. Please check your email to verify your account." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: "Invalid input data" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}