import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { GemstoneShape } from "@/lib/types/products/materials";
import { requireAuth } from "@/lib/utils/auth-utils";

const updateGemstoneSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  shape: z.nativeEnum(GemstoneShape).optional(),
  size: z.string().min(1, "Size is required").optional(),
  clarity: z.string().optional(),
  color: z.string().optional(),
  unit: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;
    
    const gemstone = await prisma.gemstone.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        _count: {
          select: {
            variantGemstones: true,
          },
        },
      },
    });
    
    if (!gemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: gemstone,
    });
  } catch (error) {
    console.error("Error fetching gemstone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gemstone" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;
    const body = await request.json();
    
    const validatedData = updateGemstoneSchema.parse(body);
    
    // Check if gemstone exists and belongs to the shop
    const existingGemstone = await prisma.gemstone.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });
    
    if (!existingGemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone not found" },
        { status: 404 }
      );
    }
    
    // If name, shape, or size is being updated, check for uniqueness
    if (validatedData.name || validatedData.shape || validatedData.size) {
      const checkName = validatedData.name || existingGemstone.name;
      const checkShape = validatedData.shape || existingGemstone.shape;
      const checkSize = validatedData.size || existingGemstone.size;
      
      const duplicateGemstone = await prisma.gemstone.findFirst({
        where: {
          shopId: session.user.shopId,
          name: checkName,
          shape: checkShape,
          size: checkSize,
          id: { not: id },
        },
      });
      
      if (duplicateGemstone) {
        return NextResponse.json(
          { success: false, error: "Gemstone with same name, shape, and size already exists" },
          { status: 400 }
        );
      }
    }
    
    const updatedGemstone = await prisma.gemstone.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            variantGemstones: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedGemstone,
      message: "Gemstone updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating gemstone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gemstone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;
    
    // Check if gemstone exists and belongs to the shop
    const existingGemstone = await prisma.gemstone.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        _count: {
          select: {
            variantGemstones: true,
          },
        },
      },
    });
    
    if (!existingGemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone not found" },
        { status: 404 }
      );
    }
    
    // Check if gemstone is being used in any variants
    if (existingGemstone._count.variantGemstones > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete gemstone. It is being used in ${existingGemstone._count.variantGemstones} product variants.` 
        },
        { status: 400 }
      );
    }
    
    await prisma.gemstone.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Gemstone deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gemstone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gemstone" },
      { status: 500 }
    );
  }
}