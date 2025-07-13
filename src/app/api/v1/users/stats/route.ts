import prisma from "@/lib/db";
import { UserRole } from "@/lib/types/settings/user-management";
import { requirePermission } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_USERS');

    const stats = await prisma.user.aggregate({
      where: { shopId: session.user.shopId },
      _count: {
        id: true,
      },
    });

    const [activeCount, inactiveCount, pendingCount, roleStats] = await Promise.all([
      prisma.user.count({
        where: { shopId: session.user.shopId, active: true },
      }),
      prisma.user.count({
        where: { shopId: session.user.shopId, active: false },
      }),
      prisma.user.count({
        where: { shopId: session.user.shopId, emailVerified: false },
      }),
      prisma.user.groupBy({
        by: ['role'],
        where: { shopId: session.user.shopId },
        _count: { role: true },
      }),
    ]);

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    return NextResponse.json({
      total: stats._count.id,
      active: activeCount,
      inactive: inactiveCount,
      pendingInvites: pendingCount,
      byRole,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}