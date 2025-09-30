import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { updateCustomerSchema } from '@/lib/validations/customers';
import { Prisma } from '@/generated/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('VIEW_CUSTOMERS');
    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        sales: {
          include: {
            items: {
              include: {
                item: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
          orderBy: { saleDate: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate customer statistics
    type CustomerWithSales = Prisma.CustomerGetPayload<{
        include: {
            sales: {
                include: {
                    items: {
                        include: {
                            item: {
                                select: {
                                    id: true;
                                    name: true;
                                    sku: true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }>;

    const customerWithSales = customer as CustomerWithSales;
    const totalPurchases = customerWithSales.sales.length;
    const totalSpent = customerWithSales.sales.reduce((sum: number, sale) => sum + sale.totalAmount, 0);
    const lastPurchaseDate = customerWithSales.sales.length > 0 ? customerWithSales.sales[0].saleDate : null;
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPurchases = customerWithSales.sales.filter((sale) => new Date(sale.saleDate) >= sixMonthsAgo);
    const isActive = recentPurchases.length > 0;

    const customerWithStats = {
      ...customerWithSales,
      totalPurchases,
      totalSpent: totalSpent / 100, // Convert from cents
      lastPurchaseDate,
      isActive,
    };

    return NextResponse.json({ customer: customerWithStats });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('EDIT_CUSTOMERS');
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateCustomerSchema.parse(body);
    
    // Check if customer exists and belongs to user's shop
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check for conflicts if phoneNumber or email is being updated
    if (validatedData.phoneNumber || validatedData.email) {
      const conflictWhere: any = {
        shopId: session.user.shopId,
        id: { not: id },
        OR: [],
      };

      if (validatedData.phoneNumber && validatedData.phoneNumber !== existingCustomer.phoneNumber) {
        conflictWhere.OR.push({ phoneNumber: validatedData.phoneNumber });
      }
      if (validatedData.email && validatedData.email !== existingCustomer.email) {
        conflictWhere.OR.push({ email: validatedData.email });
      }

      if (conflictWhere.OR.length > 0) {
        const conflictingCustomer = await prisma.customer.findFirst({
          where: conflictWhere,
        });

        if (conflictingCustomer) {
          const conflictField = conflictingCustomer.phoneNumber === validatedData.phoneNumber ? 'phoneNumber' : 'email';
          return NextResponse.json(
            { error: `Customer with this ${conflictField} already exists` },
            { status: 409 }
          );
        }
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: validatedData,
      include: {
        sales: {
          select: {
            id: true,
            totalAmount: true,
            saleDate: true,
          },
          orderBy: { saleDate: 'desc' },
        },
      },
    });

    // Calculate statistics for updated customer
    const totalPurchases = updatedCustomer.sales.length;
    const totalSpent = updatedCustomer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const lastPurchaseDate = updatedCustomer.sales.length > 0 ? updatedCustomer.sales[0].saleDate : null;
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPurchases = updatedCustomer.sales.filter(sale => new Date(sale.saleDate) >= sixMonthsAgo);
    const isActive = recentPurchases.length > 0;

    const customerWithStats = {
      ...updatedCustomer,
      sales: undefined, // Remove sales data from response
      totalPurchases,
      totalSpent: totalSpent / 100, // Convert from cents
      lastPurchaseDate,
      isActive,
    };

    return NextResponse.json({ customer: customerWithStats });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission('DELETE_CUSTOMERS');
    const { id } = await params;

    // Check if customer exists and belongs to user's shop
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        sales: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has any sales
    if (customer.sales.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete customer with existing sales history',
          salesCount: customer.sales.length
        },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}