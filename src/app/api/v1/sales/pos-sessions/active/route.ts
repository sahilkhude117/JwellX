import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { closePosSessionSchema } from '@/lib/validations/sales';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_SALES');

    // Return 404 since PosSession table doesn't exist yet
    // TODO: In future, this would query: WHERE shopId = session.user.shopId AND status = 'ACTIVE'
    
    return NextResponse.json(
      { error: 'No active POS session found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching active POS session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active POS session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requirePermission('CREATE_SALE');
    const body = await request.json();

    // Validate request body
    const validationResult = closePosSessionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { closingCash, notes } = validationResult.data;

    // TODO: POS session closing will be available after database migration
    // In future, this would:
    // 1. Find active session for shop
    // 2. Calculate expected cash from sales
    // 3. Calculate variance
    // 4. Update session status to CLOSED

    return NextResponse.json({ 
      message: 'POS session closing functionality will be available after database migration'
    }, { status: 501 });

  } catch (error) {
    console.error('Error closing POS session:', error);
    return NextResponse.json(
      { error: 'Failed to close POS session' },
      { status: 500 }
    );
  }
}