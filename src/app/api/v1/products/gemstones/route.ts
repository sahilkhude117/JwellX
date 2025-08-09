import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/utils/auth-utils";
import { z } from "zod";
import { GemstoneShape } from "@/lib/types/products/materials";

const createGemstoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shape: z.nativeEnum(GemstoneShape),
  clarity: z.string().min(1, "Clarity is required"),
  color: z.string().min(1, "Color is required"),
  unit: z.string().default("ct"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const shape = searchParams.get("shape") as GemstoneShape | null;
    
    const skip = (page - 1) * limit;
    
    const where = {
      shopId: session.user.shopId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { clarity: { contains: search, mode: "insensitive" as const } },
          { color: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(shape && { shape }),
    };
    
    const [gemstones, total] = await Promise.all([
      prisma.gemstone.findMany({
        where,
        include: {
          _count: {
            select: {
              variantGemstones: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.gemstone.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: gemstones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gemstones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gemstones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    
    const validatedData = createGemstoneSchema.parse(body);
    
    // Check if gemstone with same name, shape, and size already exists
    const existingGemstone = await prisma.gemstone.findUnique({
      where: {
        shopId_name_shape_clarity_color: {
          shopId: session.user.shopId,
          name: validatedData.name,
          shape: validatedData.shape,
          clarity: validatedData.clarity,
          color: validatedData.color,
        },
      },
    });
    
    if (existingGemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone with same name, shape, color,  already exists" },
        { status: 400 }
      );
    }
    
    const gemstone = await prisma.gemstone.create({
      data: {
        ...validatedData,
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
    
    return NextResponse.json({
      success: true,
      data: gemstone,
      message: "Gemstone created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating gemstone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gemstone" },
      { status: 500 }
    );
  }
}

