import prisma from "@/lib/db";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_INVENTORY');

        const gemstones = await prisma.gemstone.findMany({
            where: {
                shopId: session.user.shopId,
            },
            select: {
                id: true,
                name: true,
                shape: true,
                size: true,
                clarity: true,
                color: true,
                defaultRate: true,
                unit: true,
            },
            orderBy: [
                { name: 'asc' },
                { shape: 'asc' },
            ],
        });

        return NextResponse.json({ gemstones });
    } catch (error) {
        console.error('Error fetching gemstones:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gemstones' },
            { status: 500 }
        );
    }
}