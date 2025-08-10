import prisma from "@/lib/db";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_INVENTORY');

        const suppliers = await prisma.supplier.findMany({
            where: {
                shopId: session.user.shopId,
            },
            select: {
                id: true,
                name: true,
                contactNumber: true,
                email: true,
            },
            orderBy: [
                { name: 'asc' },
            ],
        });

        return NextResponse.json({ suppliers });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}