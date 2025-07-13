import prisma from "@/lib/db";
import { sendInvitationEmail } from "@/lib/email/user-invitation";
import { requirePermission } from "@/lib/utils/auth-utils";
import { generateRandomPassword, hashPassword } from "@/lib/utils/tokens";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inviteUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['SALES_STAFF', 'ARTISAN', 'ACCOUNTANT']), // Only allow non-owner roles for invites
});

export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('CREATE_USER');

        const body = await request.json();
        const { name, email, role } = inviteUserSchema.parse(body);

        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // generate username from email
        const username = email.split('@')[0];
        let uniqueUsername = username;
        let counter = 1;
        
        while (await prisma.user.findUnique({ where: { username: uniqueUsername }})) {
            uniqueUsername = `${username}${counter}`;
            counter++;
        }

        // generate verification token
        const verificationToken = crypto.randomUUID();
        const tempPassword = generateRandomPassword();
        const hashedPassword = await hashPassword(tempPassword);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                username: uniqueUsername,
                password: hashedPassword,
                role,
                shopId: session.user.shopId,
                emailVerified: false,
                hasCompletedOnboarding: false,
                verificationToken,
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        try {
            await sendInvitationEmail({
                email: user.email!,
                name: user.name,
                tempPassword,
                shopName: user.shop.name,
                inviterName: session.user.name,
                verificationToken,
            });
            } catch (emailError) {
            console.error('User created but failed to send invitation email:', emailError);
            return NextResponse.json({
                message: 'User account created, but failed to send invitation email.',
                userId: user.id,
                warning: true,
            }, { status: 202 }); // 202 Accepted, partial success
        }

        return NextResponse.json({
            message: 'Invitation sent successfully',
            userId: user.id,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error inviting user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}