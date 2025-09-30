import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch products from inventory items table
    const inventoryItems = await db.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to ProductOption format
    const products = inventoryItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.description,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching product lookup data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product lookup data' },
      { status: 500 }
    );
  }
}