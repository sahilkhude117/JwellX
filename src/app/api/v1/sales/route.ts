import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { createSaleSchema, saleQuerySchema } from '@/lib/validations/sales';
import { SaleStatus } from '@/lib/types/sales';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_SALES');
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = saleQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.errors },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      search,
      customerId,
      status,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      posSessionId,
      sortBy,
      sortOrder
    } = queryResult.data;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      shopId: session.user.shopId,
    };

    if (search) {
      where.OR = [
        { billNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phoneNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (posSessionId) where.posSessionId = posSessionId;

    // Date range filter
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) where.totalAmount.gte = minAmount;
      if (maxAmount) where.totalAmount.lte = maxAmount;
    }

    // Build order clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'saleDate':
        orderBy.saleDate = sortOrder;
        break;
      case 'totalAmount':
        orderBy.totalAmount = sortOrder;
        break;
      case 'billNumber':
        orderBy.billSeqNumber = sortOrder;
        break;
      case 'customer':
        orderBy.customer = { name: sortOrder };
        break;
      default:
        orderBy.saleDate = 'desc';
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true
            }
          },
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  huid: true,
                  grossWeight: true,
                  sellingPrice: true,
                  category: { select: { id: true, name: true } },
                  brand: { select: { id: true, name: true } }
                }
              }
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      }),
      prisma.sale.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      sales,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('CREATE_SALE');
    const body = await request.json();

    // Validate request body
    const validationResult = createSaleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { customerId, items, saleLevelDiscount, saleLevelDiscountType, payments, notes } = validationResult.data;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get next bill number
      const shopSettings = await tx.shopSettings.findUnique({
        where: { shopId: session.user.shopId }
      });

      if (!shopSettings) {
        throw new Error('Shop settings not found');
      }

      const billSeqNumber = shopSettings.nextBillNumber;
      const billNumber = `${shopSettings.billingPrefix}-${billSeqNumber.toString().padStart(6, '0')}`;

      // Calculate totals (this would be more complex with the new schema)
      let subtotal = 0;
      let totalGstAmount = 0;
      let itemLevelDiscount = 0;

      // For now, using simplified calculation based on current schema
      for (const item of items) {
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: { id: item.itemId },
          include: {
            materials: { include: { material: true } },
            gemstones: { include: { gemstone: true } }
          }
        });

        if (!inventoryItem) {
          throw new Error(`Inventory item ${item.itemId} not found`);
        }

        if (inventoryItem.quantity < item.quantity) {
          throw new Error(`Insufficient stock for item ${inventoryItem.name}`);
        }

        // Calculate material values
        let materialValue = 0;
        for (const materialBreakdown of item.materialBreakdown) {
          materialValue += materialBreakdown.weight * materialBreakdown.ratePerGram;
          totalGstAmount += (materialBreakdown.weight * materialBreakdown.ratePerGram * materialBreakdown.gstRate) / 100;
        }

        // Calculate gemstone values
        let gemstoneValue = 0;
        for (const gemstoneBreakdown of item.gemstoneBreakdown || []) {
          gemstoneValue += gemstoneBreakdown.weight * gemstoneBreakdown.ratePerCarat;
          totalGstAmount += (gemstoneBreakdown.weight * gemstoneBreakdown.ratePerCarat * gemstoneBreakdown.gstRate) / 100;
        }

        // Calculate making charges
        let makingCharge = 0;
        if (item.makingChargeType === 'PERCENTAGE') {
          makingCharge = (materialValue + gemstoneValue) * (item.makingChargeRate / 100);
        } else if (item.makingChargeType === 'PER_GRAM') {
          makingCharge = item.grossWeight * item.makingChargeRate;
        } else {
          makingCharge = item.makingChargeRate;
        }

        // Add GST on making charges (typically 5%)
        totalGstAmount += makingCharge * 0.05;

        const baseAmount = materialValue + gemstoneValue + makingCharge;
        
        // Calculate item discount
        let discountAmount = 0;
        if (item.discountType === 'PERCENTAGE') {
          discountAmount = baseAmount * (item.discountValue || 0) / 100;
        } else {
          discountAmount = item.discountValue || 0;
        }

        itemLevelDiscount += discountAmount;
        subtotal += baseAmount;
      }

      // Calculate sale level discount
      const saleLevelDiscountAmount = saleLevelDiscountType === 'PERCENTAGE' 
        ? (subtotal - itemLevelDiscount) * (saleLevelDiscount || 0) / 100
        : (saleLevelDiscount || 0);

      const totalDiscount = itemLevelDiscount + saleLevelDiscountAmount;
      const netAmount = subtotal - totalDiscount;
      const totalAmount = netAmount + totalGstAmount;
      const finalAmount = Math.round(totalAmount); // Round to nearest rupee
      const roundOffAmount = finalAmount - totalAmount;

      // Create sale
      const sale = await tx.sale.create({
        data: {
          billNumber,
          billPrefix: shopSettings.billingPrefix,
          billSeqNumber,
          customerId,
          shopId: session.user.shopId,
          userId: session.user.id,
          // Using current schema fields temporarily
          subtotal: finalAmount,
          discount: totalDiscount,
          gstAmount: totalGstAmount,
          totalAmount: finalAmount,
          paymentMethod: payments?.[0]?.paymentMethod || 'CASH',
          paymentStatus: payments && payments.length > 0 ? 'COMPLETED' : 'PENDING'
        }
      });

      // Create sale items (simplified for current schema)
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            itemId: item.itemId,
            goldRate: item.materialBreakdown.find(m => m.materialId)?.ratePerGram || 0,
            goldValue: item.materialBreakdown.reduce((sum, m) => sum + (m.weight * m.ratePerGram), 0),
            makingCharge: item.makingChargeRate,
            gstOnGold: item.materialBreakdown.reduce((sum, m) => sum + (m.weight * m.ratePerGram * m.gstRate / 100), 0),
            gstOnMaking: item.makingChargeRate * 0.05, // 5% GST on making
            totalAmount: item.materialBreakdown.reduce((sum, m) => sum + (m.weight * m.ratePerGram), 0) + item.makingChargeRate
          }
        });

        // Update inventory quantity
        await tx.inventoryItem.update({
          where: { id: item.itemId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      // Update shop settings next bill number
      await tx.shopSettings.update({
        where: { shopId: session.user.shopId },
        data: { nextBillNumber: billSeqNumber + 1 }
      });

      return sale;
    });

    // Fetch complete sale data
    const completeSale = await prisma.sale.findUnique({
      where: { id: result.id },
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

    return NextResponse.json({ sale: completeSale }, { status: 201 });

  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sale' },
      { status: 500 }
    );
  }
}