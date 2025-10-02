import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { createSaleItemSchema } from '@/lib/validations/sales';

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_INVENTORY');
    const body = await request.json();

    const { itemId, quantity, materialBreakdown, gemstoneBreakdown, makingChargeType, makingChargeRate, grossWeight, wastagePercentage, discountType, discountValue } = body;

    // Validate basic required fields
    if (!itemId || !quantity || !materialBreakdown || !makingChargeType || !makingChargeRate || !grossWeight) {
      return NextResponse.json(
        { error: 'Missing required fields for calculation' },
        { status: 400 }
      );
    }

    // Get item details
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        shopId: session.user.shopId
      },
      include: {
        materials: {
          include: {
            material: true
          }
        },
        gemstones: {
          include: {
            gemstone: true
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Get shop settings for GST rates
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { shopId: session.user.shopId }
    });

    const gstGoldRate = shopSettings?.gstGoldRate || 3.0;
    const gstMakingRate = shopSettings?.gstMakingRate || 5.0;

    // Calculate material values
    let totalMaterialValue = 0;
    let totalMaterialWeight = 0;
    let gstOnMaterials = 0;

    const calculatedMaterials = [];
    for (const materialBd of materialBreakdown) {
      const materialValue = materialBd.weight * materialBd.ratePerGram;
      const gstAmount = (materialValue * materialBd.gstRate) / 100;
      
      totalMaterialValue += materialValue;
      totalMaterialWeight += materialBd.weight;
      gstOnMaterials += gstAmount;

      calculatedMaterials.push({
        ...materialBd,
        totalValue: materialValue,
        gstAmount
      });
    }

    // Calculate gemstone values
    let totalGemstoneValue = 0;
    let totalGemstoneWeight = 0;
    let gstOnGemstones = 0;

    const calculatedGemstones = [];
    if (gemstoneBreakdown && Array.isArray(gemstoneBreakdown)) {
      for (const gemstoneBd of gemstoneBreakdown) {
        const gemstoneValue = gemstoneBd.weight * gemstoneBd.ratePerCarat;
        const gstAmount = (gemstoneValue * gemstoneBd.gstRate) / 100;
        
        totalGemstoneValue += gemstoneValue;
        totalGemstoneWeight += gemstoneBd.weight;
        gstOnGemstones += gstAmount;

        calculatedGemstones.push({
          ...gemstoneBd,
          totalValue: gemstoneValue,
          gstAmount
        });
      }
    }

    // Calculate making charges
    let makingChargeAmount = 0;
    const baseValue = totalMaterialValue + totalGemstoneValue;

    switch (makingChargeType) {
      case 'PERCENTAGE':
        makingChargeAmount = baseValue * (makingChargeRate / 100);
        break;
      case 'PER_GRAM':
        makingChargeAmount = grossWeight * makingChargeRate;
        break;
      case 'FIXED':
        makingChargeAmount = makingChargeRate;
        break;
      default:
        makingChargeAmount = 0;
    }

    // Add wastage to making charges if applicable
    if (wastagePercentage && wastagePercentage > 0) {
      const wastageAmount = baseValue * (wastagePercentage / 100);
      makingChargeAmount += wastageAmount;
    }

    // Calculate GST on making charges
    const gstOnMaking = makingChargeAmount * (gstMakingRate / 100);

    // Calculate base amount
    const baseAmount = totalMaterialValue + totalGemstoneValue + makingChargeAmount;

    // Calculate item-level discount
    let discountAmount = 0;
    if (discountValue && discountValue > 0) {
      if (discountType === 'PERCENTAGE') {
        discountAmount = baseAmount * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }

    // Calculate final amounts
    const amountAfterDiscount = baseAmount - discountAmount;
    const totalGstAmount = gstOnMaterials + gstOnGemstones + gstOnMaking;
    const totalAmount = amountAfterDiscount + totalGstAmount;

    // Calculate for the specified quantity
    const finalCalculation = {
      quantity,
      perItemCalculation: {
        materialBreakdown: calculatedMaterials,
        gemstoneBreakdown: calculatedGemstones,
        totalMaterialWeight,
        totalMaterialValue,
        totalGemstoneWeight,
        totalGemstoneValue,
        makingChargeType,
        makingChargeRate,
        makingChargeAmount,
        wastagePercentage: wastagePercentage || 0,
        baseAmount,
        discountType: discountType || 'AMOUNT',
        discountValue: discountValue || 0,
        discountAmount,
        amountAfterDiscount,
        gstOnMaterials,
        gstOnGemstones,
        gstOnMaking,
        totalGstAmount,
        totalAmount
      },
      totalCalculation: {
        totalMaterialWeight: totalMaterialWeight * quantity,
        totalMaterialValue: totalMaterialValue * quantity,
        totalGemstoneWeight: totalGemstoneWeight * quantity,
        totalGemstoneValue: totalGemstoneValue * quantity,
        totalMakingChargeAmount: makingChargeAmount * quantity,
        totalBaseAmount: baseAmount * quantity,
        totalDiscountAmount: discountAmount * quantity,
        totalAmountAfterDiscount: amountAfterDiscount * quantity,
        totalGstOnMaterials: gstOnMaterials * quantity,
        totalGstOnGemstones: gstOnGemstones * quantity,
        totalGstOnMaking: gstOnMaking * quantity,
        totalGstAmount: totalGstAmount * quantity,
        grandTotal: totalAmount * quantity
      },
      itemDetails: {
        id: item.id,
        name: item.name,
        sku: item.sku,
        huid: item.huid,
        grossWeight: item.grossWeight,
        availableQuantity: item.quantity
      }
    };

    return NextResponse.json(finalCalculation);

  } catch (error) {
    console.error('Error calculating sale pricing:', error);
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}