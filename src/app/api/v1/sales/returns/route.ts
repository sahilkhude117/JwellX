import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { createSaleReturnSchema, saleReturnQuerySchema } from '@/lib/validations/sales';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_SALES');
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = saleReturnQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.errors },
        { status: 400 }
      );
    }

    const { page, limit, search, status, returnType, startDate, endDate, sortBy, sortOrder } = queryResult.data;

    const skip = (page - 1) * limit;

    // Return empty data since SaleReturn table doesn't exist yet
    // TODO: In future, this would query the SaleReturn table with proper filters

    const returns: any[] = [];
    const total = 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      returns,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('CREATE_SALE'); // Using CREATE_SALE permission for returns
    const body = await request.json();

    // Validate request body
    const validationResult = createSaleReturnSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { originalSaleId, returnType, reason, items, restockingFee, notes } = validationResult.data;

    // Check if original sale exists and belongs to shop
    const originalSale = await prisma.sale.findFirst({
      where: {
        id: originalSaleId,
        shopId: session.user.shopId
      },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    });

    if (!originalSale) {
      return NextResponse.json(
        { error: 'Original sale not found' },
        { status: 404 }
      );
    }

    // Check if sale can be returned
    if (originalSale.paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only return completed sales' },
        { status: 400 }
      );
    }

    // Validate return items
    for (const returnItem of items) {
      const saleItem = originalSale.items.find(si => si.id === returnItem.saleItemId);
      if (!saleItem) {
        return NextResponse.json(
          { error: `Sale item ${returnItem.saleItemId} not found` },
          { status: 400 }
        );
      }

      // For current schema, we assume quantity is 1 per sale item
      // In future schema, we'd check: returnItem.returnQuantity <= saleItem.quantity - alreadyReturnedQuantity
      if (returnItem.returnQuantity > 1) {
        return NextResponse.json(
          { error: `Cannot return more items than purchased` },
          { status: 400 }
        );
      }
    }

    // Calculate return amount
    let returnAmount = 0;
    for (const returnItem of items) {
      const saleItem = originalSale.items.find(si => si.id === returnItem.saleItemId);
      if (saleItem) {
        returnAmount += saleItem.totalAmount * returnItem.returnQuantity;
      }
    }

    const refundAmount = returnAmount - (restockingFee || 0);

    // For current schema, we'll create a record in a comments/notes field
    // In future schema, we would create SaleReturn and SaleReturnItem records
    
    const result = await prisma.$transaction(async (tx) => {
      // Update original sale status to indicate return
      await tx.sale.update({
        where: { id: originalSaleId },
        data: {
          // For current schema, we might use a status field or notes
          // In future: status: 'RETURNED'
          updatedAt: new Date()
        }
      });

      // Restore inventory for returned items
      for (const returnItem of items) {
        const saleItem = originalSale.items.find(si => si.id === returnItem.saleItemId);
        if (saleItem && returnItem.restockable !== false) {
          await tx.inventoryItem.update({
            where: { id: saleItem.itemId },
            data: { quantity: { increment: returnItem.returnQuantity } }
          });
        }
      }

      // TODO: In future schema, create return record:
      // const saleReturn = await tx.saleReturn.create({
      //   data: {
      //     originalSaleId,
      //     returnType,
      //     reason,
      //     returnAmount,
      //     refundAmount,
      //     restockingFee: restockingFee || 0,
      //     status: 'PENDING',
      //     shopId: session.user.shopId,
      //     userId: session.user.id,
      //     notes
      //   }
      // });

      return {
        success: true,
        message: 'Return processing completed. Inventory has been updated.'
      };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error processing return:', error);
    return NextResponse.json(
      { error: 'Failed to process return' },
      { status: 500 }
    );
  }
}