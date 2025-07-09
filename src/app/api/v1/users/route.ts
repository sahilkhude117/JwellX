import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/utils/auth-utils";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const session = await requirePermission("VIEW_USERS")

        const users = await prisma.user.findMany({
            where: {
                shopId: session.user.shopId
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                active: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
