// src/app/api/v1/materials/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/utils/auth-utils";
import { z } from "zod";
import { MaterialType } from "@/lib/types/products/materials";

const updateMaterialSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.nativeEnum(MaterialType).optional(),
  purity: z.string().min(1, "Purity is required").optional(),
  unit: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    
    const material = await prisma.material.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        _count: {
          select: {
            inventoryItems: true,
          },
        },
      },
    });
    
    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch material" },
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
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateMaterialSchema.parse(body);
    
    // Check if material exists and belongs to the shop
    const existingMaterial = await prisma.material.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });
    
    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }
    
    // If name or purity is being updated, check for uniqueness
    if (validatedData.name || validatedData.purity) {
      const checkName = validatedData.name || existingMaterial.name;
      const checkPurity = validatedData.purity || existingMaterial.purity;
      
      const duplicateMaterial = await prisma.material.findFirst({
        where: {
          shopId: session.user.shopId,
          name: checkName,
          purity: checkPurity,
          id: { not: id },
        },
      });
      
      if (duplicateMaterial) {
        return NextResponse.json(
          { success: false, error: "Material with same name and purity already exists" },
          { status: 400 }
        );
      }
    }
    
    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            inventoryItems: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedMaterial,
      message: "Material updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update material" },
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
    const { id } = await params;
    
    // Check if material exists and belongs to the shop
    const existingMaterial = await prisma.material.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
      include: {
        _count: {
          select: {
            inventoryItems: true,
          },
        },
      },
    });
    
    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }
    
    // Check if material is being used in any variants
    if (existingMaterial._count.inventoryItems > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete material. It is being used in ${existingMaterial._count.inventoryItems} product variants.` 
        },
        { status: 400 }
      );
    }
    
    await prisma.material.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete material" },
      { status: 500 }
    );
  }
}