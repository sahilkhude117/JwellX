import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/utils/auth-utils";
import { z } from "zod";
import { MaterialType } from "@/lib/types/products/materials";

const createMaterialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(MaterialType),
  purity: z.string().min(1, "Purity is required"),
  unit: z.string().default("g"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") as MaterialType | null;
    
    const skip = (page - 1) * limit;
    
    const where = {
      shopId: session.user.shopId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { purity: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(type && { type }),
    };
    
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          _count: {
            select: {
              variantMaterials: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.material.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    
    const validatedData = createMaterialSchema.parse(body);
    
    // Check if material with same name and purity already exists
    const existingMaterial = await prisma.material.findUnique({
      where: {
        shopId_name_purity: {
          shopId: session.user.shopId,
          name: validatedData.name,
          purity: validatedData.purity,
        },
      },
    });
    
    if (existingMaterial) {
      return NextResponse.json(
        { success: false, error: "Material with same name and purity already exists" },
        { status: 400 }
      );
    }
    
    const material = await prisma.material.create({
      data: {
        ...validatedData,
        shopId: session.user.shopId,
      },
      include: {
        _count: {
          select: {
            variantMaterials: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: material,
      message: "Material created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create material" },
      { status: 500 }
    );
  }
}