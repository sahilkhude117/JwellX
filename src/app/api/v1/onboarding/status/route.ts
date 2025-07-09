import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/utils/auth-utils';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await requireRole('OWNER')
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id, role: 'OWNER' },
      select: { hasCompletedOnboarding: true }
    });

    return NextResponse.json({
      hasCompletedOnboarding: user?.hasCompletedOnboarding || false
    });

  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}