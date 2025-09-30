import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch users with basic info
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to UserOption format
    const userOptions = users.map((user: any) => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: user.role,
    }));

    return NextResponse.json({ users: userOptions });
  } catch (error) {
    console.error('Error fetching user lookup data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user lookup data' },
      { status: 500 }
    );
  }
}