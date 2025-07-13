import prisma from "@/lib/db";
import { sendInvitationEmail } from "@/lib/email/user-invitation";
import { UserRole } from "@/lib/types/settings/user-management";
import { requirePermission } from "@/lib/utils/auth-utils";
import { generateRandomPassword, hashPassword } from "@/lib/utils/tokens";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['OWNER', 'SALES_STAFF', 'ARTISAN', 'ACCOUNTANT']),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_USERS');

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') as UserRole | null;
        const active = searchParams.get('active');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const where: any = {
            shopId: session.user.shopId,
        };

        if (role) where.role = role;
        if (active !== null) where.active = active === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    shop: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit),
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('CREATE_USER');
        const body = await request.json();
        const { name, email, role, username } = createUserSchema.parse(body);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or username already exists' },
                { status: 409 }
            )
        }

        // generate temporary password
        const tempPassword = generateRandomPassword();
        const hashedPassword = await hashPassword(tempPassword);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                username,
                password: hashedPassword,
                role,
                shopId: session.user.shopId,
                emailVerified: false,
                hasCompletedOnboarding: false
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        await sendInvitationEmail({
            email: user.email!,
            name: user.name,
            tempPassword,
            shopName: user.shop.name,
            inviterName: session.user.name,
        });

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}