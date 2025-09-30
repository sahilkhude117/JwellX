import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';

export async function DELETE(request: NextRequest) {
  try {
    const session = await requirePermission('DELETE_CUSTOMERS');
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: ids array is required' },
        { status: 400 }
      );
    }

    // Validate that all customers exist and belong to user's shop
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: ids },
        shopId: session.user.shopId,
      },
      include: {
        sales: true,
      },
    });

    if (customers.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more customers not found' },
        { status: 404 }
      );
    }

    // Check if any customers have sales history
    const customersWithSales = customers.filter(customer => customer.sales.length > 0);
    if (customersWithSales.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete customers with existing sales history',
          customersWithSales: customersWithSales.map(customer => ({ 
            id: customer.id, 
            name: customer.name,
            salesCount: customer.sales.length 
          }))
        },
        { status: 400 }
      );
    }

    // Perform bulk delete
    const deleteResult = await prisma.customer.deleteMany({
      where: {
        id: { in: ids },
        shopId: session.user.shopId,
      },
    });

    return NextResponse.json({
      message: `${deleteResult.count} customers deleted successfully`,
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting customers:', error);
    return NextResponse.json(
      { error: 'Failed to delete customers' },
      { status: 500 }
    );
  }
}