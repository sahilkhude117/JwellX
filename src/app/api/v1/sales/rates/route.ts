import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { getCurrentRatesSchema } from '@/lib/validations/sales';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('VIEW_INVENTORY');
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = getCurrentRatesSchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.errors },
        { status: 400 }
      );
    }

    const { materialIds, gemstoneIds } = queryResult.data;

    const where = { shopId: session.user.shopId };

    // Get materials with current rates
    const materialWhere = materialIds ? { ...where, id: { in: materialIds } } : where;
    const materials = await prisma.material.findMany({
      where: materialWhere,
      select: {
        id: true,
        name: true,
        type: true,
        purity: true,
        defaultRate: true,
        unit: true,
        updatedAt: true
      }
    });

    // Get gemstones with current rates
    const gemstoneWhere = gemstoneIds ? { ...where, id: { in: gemstoneIds } } : where;
    const gemstones = await prisma.gemstone.findMany({
      where: gemstoneWhere,
      select: {
        id: true,
        name: true,
        shape: true,
        clarity: true,
        color: true,
        defaultRate: true,
        unit: true,
        updatedAt: true
      }
    });

    // Format response
    const rateInfo = {
      materials: materials.map(material => ({
        materialId: material.id,
        name: material.name,
        type: material.type,
        purity: material.purity,
        currentRate: material.defaultRate,
        lastUpdated: material.updatedAt
      })),
      gemstones: gemstones.map(gemstone => ({
        gemstoneId: gemstone.id,
        name: gemstone.name,
        shape: gemstone.shape,
        clarity: gemstone.clarity,
        color: gemstone.color,
        currentRate: gemstone.defaultRate,
        lastUpdated: gemstone.updatedAt
      }))
    };

    return NextResponse.json(rateInfo);

  } catch (error) {
    console.error('Error fetching current rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('MANAGE_GOLD_RATES');
    const body = await request.json();

    const { materialRates, gemstoneRates } = body;

    // Validate that rates are provided
    if (!materialRates && !gemstoneRates) {
      return NextResponse.json(
        { error: 'No rates provided for update' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updates = [];

      // Update material rates
      if (materialRates && Array.isArray(materialRates)) {
        for (const rate of materialRates) {
          const { materialId, buyingRate, sellingRate } = rate;
          
          // Verify material belongs to shop
          const material = await tx.material.findFirst({
            where: { id: materialId, shopId: session.user.shopId }
          });

          if (!material) {
            throw new Error(`Material ${materialId} not found`);
          }

          // For current schema, update defaultRate
          // In future schema, create MaterialRate record
          const updatedMaterial = await tx.material.update({
            where: { id: materialId },
            data: { 
              defaultRate: sellingRate,
              updatedAt: new Date()
            }
          });

          updates.push({
            type: 'material',
            id: materialId,
            name: material.name,
            oldRate: material.defaultRate,
            newRate: sellingRate
          });
        }
      }

      // Update gemstone rates
      if (gemstoneRates && Array.isArray(gemstoneRates)) {
        for (const rate of gemstoneRates) {
          const { gemstoneId, buyingRate, sellingRate } = rate;
          
          // Verify gemstone belongs to shop
          const gemstone = await tx.gemstone.findFirst({
            where: { id: gemstoneId, shopId: session.user.shopId }
          });

          if (!gemstone) {
            throw new Error(`Gemstone ${gemstoneId} not found`);
          }

          // For current schema, update defaultRate
          // In future schema, create GemstoneRate record
          const updatedGemstone = await tx.gemstone.update({
            where: { id: gemstoneId },
            data: { 
              defaultRate: sellingRate,
              updatedAt: new Date()
            }
          });

          updates.push({
            type: 'gemstone',
            id: gemstoneId,
            name: gemstone.name,
            oldRate: gemstone.defaultRate,
            newRate: sellingRate
          });
        }
      }

      return updates;
    });

    return NextResponse.json({ 
      message: 'Rates updated successfully',
      updates: result
    });

  } catch (error) {
    console.error('Error updating rates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update rates' },
      { status: 500 }
    );
  }
}