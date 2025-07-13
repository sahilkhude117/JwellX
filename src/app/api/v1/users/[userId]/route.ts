import prisma from "@/lib/db";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['OWNER', 'SALES_STAFF', 'ARTISAN', 'ACCOUNTANT']).optional(),
  active: z.boolean().optional(),
  username: z.string().min(3).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await requirePermission('VIEW_USERS');
        
        const user = await prisma.user.findFirst({
            where: {
                id: params.userId,
                shopId: session.user.shopId
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
                { errror: 'user not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string }}
) {
    try {
        const session = await requirePermission('EDIT_USER')

        const body = await request.json();
        const updateData = updateUserSchema.parse(body);

        const existingUser = await prisma.user.findFirst({
            where: {
                id: params.userId,
                shopId: session.user.shopId,
            },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (existingUser.id === session.user.id && updateData.active === false) {
            return NextResponse.json(
                { error: 'Cannot deactivate your own account' },
                { status: 400 }
            );
        }

        // check for email/username conflicts
        if (updateData.email || updateData.username) {
            const conflicts = await prisma.user.findFirst({
                where: {
                    id: { not: params.userId },
                    OR: [
                        ...(updateData.email ? [{ email: updateData.email }] : []),
                        ...(updateData.username ? [{ username: updateData.username }] : []),
                    ],
                },
            });

            if (conflicts) {
                return NextResponse.json(
                    { error: 'Email or username already exists' },
                    { status: 409 }
                )
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.userId },
            data: updateData,
            include: {
                shop: {
                select: {
                    id: true,
                    name: true,
                },
                },
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: 'Validation error', details: error.errors },
            { status: 400 }
        );
        }

        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await requirePermission('DELETE_USER')

        const user = await prisma.user.findFirst({
            where: {
                id: params.userId,
                shopId: session.user.shopId,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent self-deletion
        if (user.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: params.userId },
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}