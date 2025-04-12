// src/app/api/test/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * @swagger
 * /api/v1/test:
 *   get:
 *     summary: Test API endpoint that fetches or creates a sample shop
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Successfully retrieved shop data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET() {
  try {
    // Get all shops (or create one if none exist)
    let shops = await prisma.shop.findMany({
      include: {
        settings: true
      }
    });

    // If no shops exist, create a sample shop
    if (shops.length === 0) {
      const newShop = await prisma.shop.create({
        data: {
          name: 'Test Jewelry Shop',
          address: '123 Jewelry Lane, Mumbai, India',
          gstin: 'TEST27AAPFU0939F1ZV',
          contactNumber: '+91 9876543210',
          email: 'test@jewelryshop.com',
          settings: {
            create: {
              defaultMakingChargeType: 'PERCENTAGE',
              defaultMakingChargeValue: 12.5,
              gstGoldRate: 3.0,
              gstMakingRate: 5.0,
              primaryLanguage: 'en',
              billingPrefix: 'TST'
            }
          }
        },
        include: {
          settings: true
        }
      });
      
      shops = [newShop];
    }
    
    return NextResponse.json({ success: true, data: shops }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}