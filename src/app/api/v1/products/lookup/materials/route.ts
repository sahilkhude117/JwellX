import prisma from "@/lib/db";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_INVENTORY');

        const materials = await prisma.material.findMany({
            where: {
                shopId: session.user.shopId,
            },
            select: {
                id: true,
                name: true,
                type: true,
                purity: true,
                defaultRate: true,
                unit: true,
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json({ materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        return NextResponse.json(
            { error: 'Failed to fetch materials' },
            { status: 500 }
        );
    }
}