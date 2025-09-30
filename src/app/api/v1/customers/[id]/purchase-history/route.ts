import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentSession } from '@/lib/utils/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;

    const customerId = params.id;

    // Fetch customer to verify it exists and belongs to the user's shop
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        shopId: user.shopId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch purchase history (sales) for this customer
    const sales = await prisma.sale.findMany({
      where: {
        customerId: customerId,
        shopId: user.shopId,
      },
      select: {
        id: true,
        billNumber: true,
        totalAmount: true,
        paymentStatus: true,
        saleDate: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            goldValue: true,
            makingCharge: true,
            totalAmount: true,
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    // Transform the data for the frontend
    const salesData = sales.map((sale: any) => ({
      id: sale.id,
      billNumber: sale.billNumber,
      saleDate: sale.saleDate,
      totalAmount: sale.totalAmount,
      paymentStatus: sale.paymentStatus,
      items: sale.items.map((item: any) => ({
        id: item.id,
        itemName: item.item.name,
        quantity: 1, // Jewelry items are typically single pieces
        unitPrice: item.totalAmount,
        totalPrice: item.totalAmount,
      })),
    }));

    // Calculate summary statistics
    const totalSales = sales.length;
    const totalSpent = sales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);
    const averageOrderValue = totalSales > 0 ? totalSpent / totalSales : 0;
    
    // Get date range
    const firstPurchase = sales.length > 0 ? sales[sales.length - 1].saleDate : null;
    const lastPurchase = sales.length > 0 ? sales[0].saleDate : null;

    const response = {
      customerId: customer.id,
      sales: salesData,
      summary: {
        totalPurchases: totalSales,
        totalSpent,
        averageOrderValue,
        firstPurchase,
        lastPurchase,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching customer purchase history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}