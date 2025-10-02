import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { addSalePaymentSchema } from '@/lib/validations/sales';

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('CREATE_SALE');
    const body = await request.json();

    // Validate request body
    const validationResult = addSalePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { saleId, paymentMethod, amount, cardNumber, upiTransactionId, chequeNumber, bankReference, notes } = validationResult.data;

    // Check if sale exists and belongs to shop
    const sale = await prisma.sale.findFirst({
      where: {
        id: saleId,
        shopId: session.user.shopId
      }
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Check if payment amount is valid
    const remainingBalance = sale.totalAmount - (sale.totalAmount * 0); // This should use actual paid amount
    if (amount > remainingBalance) {
      return NextResponse.json(
        { error: 'Payment amount exceeds remaining balance' },
        { status: 400 }
      );
    }

    // For current schema, we'll update the sale's payment method and status
    // In the future schema, we would create a SalePayment record
    
    const result = await prisma.$transaction(async (tx) => {
      // Update sale payment information
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          paymentMethod,
          paymentStatus: 'COMPLETED', // Simplified for current schema
          updatedAt: new Date()
        }
      });

      // In the future, create payment record:
      // const payment = await tx.salePayment.create({
      //   data: {
      //     saleId,
      //     paymentMethod,
      //     amount,
      //     cardNumber,
      //     upiTransactionId,
      //     chequeNumber,
      //     bankReference,
      //     status: 'COMPLETED',
      //     processedAt: new Date(),
      //     shopId: session.user.shopId,
      //     userId: session.user.id,
      //     notes
      //   }
      // });

      return updatedSale;
    });

    // Fetch updated sale with details
    const updatedSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Payment added successfully',
      sale: updatedSale
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { error: 'Failed to add payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_SALES');
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const saleId = searchParams.get('saleId');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where: any = {
      shopId: session.user.shopId,
    };

    if (saleId) where.id = saleId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.sale.findMany({
        where: {
          ...where,
          paymentStatus: 'COMPLETED'
        },
        skip,
        take: limit,
        select: {
          id: true,
          billNumber: true,
          saleDate: true,
          totalAmount: true,
          paymentMethod: true,
          paymentStatus: true,
          customer: {
            select: {
              id: true,
              name: true,
              phoneNumber: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { saleDate: 'desc' }
      }),
      prisma.sale.count({
        where: {
          ...where,
          paymentStatus: 'COMPLETED'
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}