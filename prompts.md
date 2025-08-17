Role: You are nextjs developer building backends for jwellery shops pos systems.
Task: Your job is to create a crud apis for inventory. that includes create inventory, view bulk, view one, update one, delete one. also the types, zod schema and validations , api clients and hooks for this.
Instructions:
most important analyse the current db schema and build everything accorfing to that. 
1. api should follow this structure => export async function POST/GET/PATCH/DELETE(request: NextRequest) {}.
2. api client should use api export from "@lib/api" which supports api.get/patch/delete/post methods for ex => api.get<CategoryResponse>(`/v1/products/categories/${id}`),
3. hooks should use react-query i.e tanstack. 
Data: 
here are some examples for just to understand code practices we follow use those code practice to build 
imp: db schema => generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator seed {
    provider = "prisma-client-js"
}

model User {
  id            String     @id @default(uuid()) 
  username      String     @unique
  email         String?     @unique
  emailVerified Boolean    @default(false)
  verificationToken String?
  password      String
  name          String
  resetToken    String?
  resetTokenExpiry DateTime?
  role          UserRole
  active        Boolean    @default(true)
  lastLoginAt   DateTime?
  hasCompletedOnboarding Boolean @default(false)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  shop          Shop       @relation(fields: [shopId], references: [id])
  shopId        String
  sales         Sale[]
  auditLogs     AuditLog[]
  
  // ADDED ALL BACK RELATIONS (critical fixes)
  inventoryItemsCreatedBy InventoryItem[] @relation("InventoryItemCreatedBy")
  inventoryItemsUpdatedBy InventoryItem[] @relation("InventoryItemUpdatedBy")
  stockAdjustments        StockAdjustment[] @relation("StockAdjustmentByUser")
  purchaseHistory         PurchaseHistory[] @relation("PurchaseHistoryByUser")

  @@index([shopId, role, active])
  @@index([username])
}

enum UserRole {
  OWNER
  SALES_STAFF
  ARTISAN     // For future use
  ACCOUNTANT  // For future use
}

// Shop Settings (updated with all back relations)
model Shop {
  id            String         @id @default(uuid())
  name          String
  address       String?
  gstin         String?        @unique
  contactNumber String?  
  email         String?
  logoUrl       String?
  active        Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  settings      ShopSettings?
  users         User[]
  inventory     InventoryItem[]
  sales         Sale[]
  customers     Customer[]

  categories    Category[]
  brands        Brand[]
  materials     Material[]
  gemstones     Gemstone[]
  
  // ADDED ALL BACK RELATIONS (critical fixes)
  suppliers             Supplier[] @relation("SupplierShop")
  stockAdjustments      StockAdjustment[] @relation("StockAdjustmentShop")
  purchaseHistory       PurchaseHistory[] @relation("PurchaseHistoryShop")

  @@index([active])
}

model ShopSettings {
  id                        String     @id @default(uuid())
  defaultMakingChargeType   ChargeType @default(PERCENTAGE)
  defaultMakingChargeValue  Float      @default(10.0)
  gstGoldRate               Float      @default(3.0)
  gstMakingRate             Float      @default(5.0)
  primaryLanguage           String     @default("en") // For language preference
  billingPrefix             String     @default("INV") // For bill numbering
  nextBillNumber            Int        @default(1)    // Auto-increment counter for billing
  invoiceTemplateId         String?
  shop                      Shop       @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId                    String     @unique
  createdAt                 DateTime   @default(now())
  updatedAt                 DateTime   @updatedAt
}

model InvoiceTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?
  previewUrl  String   // URL to preview image
  templateType String  // 'classic', 'modern', 'minimal', etc.
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive, templateType])
}

enum ChargeType {
  PERCENTAGE
  PER_GRAM
  FIXED
}

// Category (updated relationship)
model Category {
  id            String         @id @default(uuid())
  name          String
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  shop          Shop           @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId        String

  inventoryItems InventoryItem[]  // Replaced products

  @@index([shopId])
  @@unique([shopId, name])
}

// Brand (updated relationship)
model Brand {
  id            String  @id @default(uuid())
  name          String
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  shop          Shop           @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId        String

  inventoryItems InventoryItem[]  // Replaced products

  @@unique([shopId, name])
  @@index([shopId])
}

// Material (updated relationship)
model Material {
  id            String @id @default(uuid())
  name          String
  type          MaterialType
  purity        String
  defaultRate   Float @default(0)
  unit          String @default("g")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  shop          Shop                 @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId        String

  inventoryItems InventoryItemMaterial[]  // Replaced variantMaterials

  @@unique([shopId, name, purity])
  @@index([shopId])
}

enum MaterialType {
  GOLD
  SILVER
  PLATINUM
  PALLADIUM
  OTHER
}

// Gemstone (updated relationship)
model Gemstone {
  id           String @id @default(uuid())
  name         String
  shape        GemstoneShape
  clarity      String
  color        String
  defaultRate  Float @default(0)
  unit         String @default("ct")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  shop          Shop                 @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId        String

  inventoryItems InventoryItemGemstone[]  // Replaced variantGemstones

  @@unique([shopId, name, shape, clarity, color])
  @@index([shopId])
}

enum GemstoneShape {
  ROUND
  OVAL
  PEAR 
  EMERALD
  PRINCESS
  MARQUISE
  OTHER
}

// NEW SUPPLIER MODULE (fixed relations)
model Supplier {
  id            String          @id @default(uuid())
  name          String
  contactNumber String
  email         String?
  address       String?
  gstin         String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  shop          Shop            @relation("SupplierShop", fields: [shopId], references: [id])
  shopId        String
  inventory     InventoryItem[]
  purchases     PurchaseHistory[]

  @@index([shopId])
  @@index([name])
  @@unique([shopId, contactNumber])
}

// INVENTORY MODULE (COMPLETE RESTRUCTURE)
model InventoryItem {
  id                String                  @id @default(uuid())
  name              String
  sku               String                  @unique
  description       String?
  hsnCode           String?
  huid              String?                 // Optional HUID
  grossWeight       Float                   // Total weight in grams (material + gemstone converted)
  wastage           Float?                  // Percentage or value
  quantity          Int                     @default(1)
  location          String?                 // Storage location in shop
  sellingPrice      Float                   // Auto-calculated for reporting
  isRawMaterial     Boolean                 @default(false)
  status            InventoryItemStatus     @default(IN_STOCK)
  
  // Product attributes (atomic fields per 4NF)
  gender            String?                 // e.g., "Male", "Female", "Unisex"
  occasion          String?                 // e.g., "Wedding", "Casual"
  style             String?                 // e.g., "Traditional", "Modern"
  
  // Pricing structure
  makingChargeType  ChargeType
  makingChargeValue Float
  
  // Relationships
  shop              Shop                    @relation(fields: [shopId], references: [id])
  shopId            String
  category          Category                @relation(fields: [categoryId], references: [id])
  categoryId        String
  brand             Brand?                  @relation(fields: [brandId], references: [id])
  brandId           String?
  supplier          Supplier?               @relation(fields: [supplierId], references: [id])
  supplierId        String?
  
  // FIXED RELATIONS WITH EXPLICIT NAMES
  createdBy         User                    @relation("InventoryItemCreatedBy", fields: [createdById], references: [id])
  createdById       String
  updatedBy         User                    @relation("InventoryItemUpdatedBy", fields: [updatedById], references: [id])
  updatedById       String
  
  materials         InventoryItemMaterial[]
  gemstones         InventoryItemGemstone[]
  stockAdjustments  StockAdjustment[]
  saleItems         SaleItem[]
  purchaseHistory   PurchaseHistoryItem[]   // For purchase traceability

  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  // Optimized indexes for reporting
  @@index([shopId, status, createdAt])
  @@index([shopId, categoryId, status])
  @@index([shopId, brandId, status])
  @@index([shopId, supplierId])
  @@index([huid]) 
  @@index([isRawMaterial, status])
}

enum InventoryItemStatus {
  IN_STOCK
  SOLD
  RESERVED
  DAMAGED
  LOST
}

// NEW: INVENTORY COMPOSITION (4NF COMPLIANT)
model InventoryItemMaterial {
  id           String   @id @default(uuid())
  inventoryItem InventoryItem @relation(fields: [inventoryItemId], references: [id], onDelete: Cascade)
  inventoryItemId String
  material     Material @relation(fields: [materialId], references: [id])
  materialId   String
  weight       Float    // Per-piece weight in grams
  buyingPrice  Float    // Per-gram price at purchase

  @@unique([inventoryItemId, materialId])
  @@index([materialId])
}

model InventoryItemGemstone {
  id           String   @id @default(uuid())
  inventoryItem InventoryItem @relation(fields: [inventoryItemId], references: [id], onDelete: Cascade)
  inventoryItemId String
  gemstone     Gemstone @relation(fields: [gemstoneId], references: [id])
  gemstoneId   String
  weight       Float    // Per-piece weight in carats
  buyingPrice  Float    // Per-carat price at purchase

  @@unique([inventoryItemId, gemstoneId])
  @@index([gemstoneId])
}

// NEW: STOCK ADJUSTMENT TRACKING (fixed relations)
model StockAdjustment {
  id          String                @id @default(uuid())
  inventoryItem InventoryItem      @relation(fields: [inventoryItemId], references: [id])
  inventoryItemId String
  adjustment  Int                   // Positive = increase, Negative = decrease
  reason      String                // e.g., "damage", "theft", "count adjustment"
  adjustedBy  User                  @relation("StockAdjustmentByUser", fields: [userId], references: [id])
  userId      String
  shop        Shop                  @relation("StockAdjustmentShop", fields: [shopId], references: [id])
  shopId      String
  createdAt   DateTime              @default(now())

  @@index([inventoryItemId, createdAt(sort: Desc)])
  @@index([shopId, createdAt(sort: Desc)])
  @@index([shopId, userId, createdAt])
}

// NEW: PURCHASE HISTORY (fixed relations)
model PurchaseHistory {
  id            String              @id @default(uuid())
  shop          Shop                @relation("PurchaseHistoryShop", fields: [shopId], references: [id])
  shopId        String
  supplier      Supplier            @relation(fields: [supplierId], references: [id])
  supplierId    String
  purchaseDate  DateTime            @default(now())
  totalAmount   Float
  createdBy     User                @relation("PurchaseHistoryByUser", fields: [userId], references: [id])
  userId        String
  items         PurchaseHistoryItem[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([shopId, purchaseDate(sort: Desc)])
  @@index([shopId, supplierId])
}

model PurchaseHistoryItem {
  id              String            @id @default(uuid())
  purchaseHistory PurchaseHistory  @relation(fields: [purchaseHistoryId], references: [id], onDelete: Cascade)
  purchaseHistoryId String
  inventoryItem   InventoryItem     @relation(fields: [inventoryItemId], references: [id])
  inventoryItemId String
  quantity        Int
  unitPrice       Float             // Per-piece purchase price
  createdAt       DateTime          @default(now())

  @@index([purchaseHistoryId])
  @@index([inventoryItemId])
}

// Sales Management (unchanged except inventory references)
model Sale {
  id            String        @id @default(uuid())
  billNumber    String       
  billPrefix    String       
  billSeqNumber Int          
  saleDate      DateTime      @default(now())
  customer      Customer?     @relation(fields: [customerId], references: [id])
  customerId    String?
  items         SaleItem[]
  subtotal      Float
  discount      Float         @default(0)
  discountType  DiscountType  @default(AMOUNT)
  gstAmount     Float
  totalAmount   Float
  paymentMethod PaymentMethod
  paymentStatus PaymentStatus @default(COMPLETED)
  paymentDetails Json?        
  shop          Shop          @relation(fields: [shopId], references: [id])
  shopId        String
  createdBy     User          @relation(fields: [userId], references: [id])
  userId        String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([shopId, billNumber])
  @@index([shopId, billSeqNumber(sort: Desc)])
  @@index([shopId, saleDate(sort: Desc)])
  @@index([customerId, saleDate(sort: Desc)])
  @@index([shopId, paymentStatus])
  @@index([userId, saleDate(sort: Desc)])
}

model SaleItem {
  id              String        @id @default(uuid())
  sale            Sale          @relation(fields: [saleId], references: [id], onDelete: Cascade)
  saleId          String
  item            InventoryItem @relation(fields: [itemId], references: [id])
  itemId          String
  goldRate        Float         
  goldValue       Float         
  makingCharge    Float         
  gstOnGold       Float         
  gstOnMaking     Float         
  totalAmount     Float
  createdAt       DateTime      @default(now())

  @@index([saleId])
  @@index([itemId, saleId])
}

enum DiscountType {
  PERCENTAGE
  AMOUNT
}

enum PaymentMethod {
  CASH
  CARD
  UPI
  BANK_TRANSFER
  OTHER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}

// Customer Management (unchanged)
model Customer {
  id            String    @id @default(uuid())
  name          String
  phoneNumber   String
  email         String?
  address       String?
  shop          Shop      @relation(fields: [shopId], references: [id])
  shopId        String
  sales         Sale[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([shopId, phoneNumber])
}

// Audit Logging (unchanged)
model AuditLog {
  id            String    @id @default(uuid())
  action        String
  entityType    String
  entityId      String
  description   String
  metadata      Json?
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  createdAt     DateTime  @default(now())
  yearMonth     String    @default(dbgenerated("to_char(now(), 'YYYY-MM')"))

  @@index([userId, createdAt(sort: Desc)])
  @@index([entityType, entityId])
  @@index([yearMonth, createdAt])
}
1. api ex => import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/utils/auth-utils';
import { updateBrandSchema } from '@/lib/types/products/categories';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const brand = await prisma.brand.findFirst({
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

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
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
    
    const validatedData = updateBrandSchema.parse(body);
    
    // Check if brand exists and belongs to user's shop
    const existingBrand = await prisma.brand.findFirst({
      where: {
        id,
        shopId: session.user.shopId,
      },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if name is being updated and if it conflicts
    if (validatedData.name && validatedData.name !== existingBrand.name) {
      const nameExists = await prisma.brand.findUnique({
        where: {
          shopId_name: {
            shopId: session.user.shopId,
            name: validatedData.name,
          },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Brand name already exists' },
          { status: 409 }
        );
      }
    }

    const brand = await prisma.brand.update({
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

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Error updating brand:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update brand' },
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

    // Check if brand exists and belongs to user's shop
    const brand = await prisma.brand.findFirst({
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

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if brand has products
    if (brand._count.inventoryItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing products' },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
},import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/utils/auth-utils';
import { createBrandSchema } from '@/lib/types/products/categories';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where = {
      shopId: session.user.shopId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              inventoryItems: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.brand.count({ where }),
    ]);

    return NextResponse.json({
      brands,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    
    const validatedData = createBrandSchema.parse(body);
    
    // Check if brand name already exists for this shop
    const existingBrand = await prisma.brand.findUnique({
      where: {
        shopId_name: {
          shopId: session.user.shopId,
          name: validatedData.name,
        },
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand name already exists' },
        { status: 409 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        ...validatedData,
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

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}.
api client => import { api } from "@/lib/api";
import { BrandResponse, BrandsResponse, CategoriesResponse, CategoryResponse, CreateBrandData, CreateCategoryData, UpdateBrandData, UpdateCategoryData } from "@/lib/types/products/categories";

export const categoriesApi = {
    getCategories: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);

        return api.get<CategoriesResponse>(`/v1/products/categories?${searchParams.toString()}`)
    },

    getCategory: (id: string) =>
        api.get<CategoryResponse>(`/v1/products/categories/${id}`),

    createCategory: (data: CreateCategoryData) =>
        api.post<CategoryResponse>(`/v1/products/categories`, data),

    updateCategory: (id: string, data: UpdateCategoryData) =>
        api.patch<CategoryResponse>(`/v1/products/categories/${id}`, data),

    deleteCategory: (id: string) =>
        api.delete(`/v1/products/categories/${id}`),
} 

export const brandsApi = {
    getBrands: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        
        return api.get<BrandsResponse>(`/v1/products/brands?${searchParams.toString()}`);
    },

  getBrand: (id: string) =>
    api.get<BrandResponse>(`/v1/products/brands/${id}`),

  createBrand: (data: CreateBrandData) =>
    api.post<BrandResponse>('/v1/products/brands', data),

  updateBrand: (id: string, data: UpdateBrandData) =>
    api.patch<BrandResponse>(`/v1/products/brands/${id}`, data),

  deleteBrand: (id: string) =>
    api.delete(`/v1/products/brands/${id}`),
}
hooks => import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '@/lib/api/products/categories';
import { CreateBrandData, UpdateBrandData } from '@/lib/types/products/categories';
import { toast } from '@/components/ui/use-toast';
import { QUERY_KEYS } from '@/lib/utils/products/query-keys';

export const useBrands = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: QUERY_KEYS.brands.list(params),
    queryFn: () => brandsApi.getBrands(params),
    staleTime: Infinity, 
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.brands.detail(id),
    queryFn: () => brandsApi.getBrand(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBrandData) => brandsApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands.all });
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
    },
    onError: (error: any) => {
      //handled in form
    },
  });
}

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandData }) =>
      brandsApi.updateBrand(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands.all });
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
    },
    onError: (error: any) => {
      // handled in form
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => brandsApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands.all });
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
    },
    onError: (error: any) => {
        toast({
            title: "Error",
            description: error.message || "Failed to delete brand",
            variant: "destructive",
        })
    },
  });
};
query keys => export const QUERY_KEYS = {
  
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...QUERY_KEYS.categories.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.categories.lists(), params] as const,
    details: () => [...QUERY_KEYS.categories.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.categories.details(), id] as const,
    // For product lookup (simple list without pagination)
    lookup: () => [...QUERY_KEYS.categories.all, 'lookup'] as const,
  },
  
  // Brands
  brands: {
    all: ['brands'] as const,
    lists: () => [...QUERY_KEYS.brands.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.brands.lists(), params] as const,
    details: () => [...QUERY_KEYS.brands.all, 'detail'] as const,  
    detail: (id: string) => [...QUERY_KEYS.brands.details(), id] as const,
    // For product lookup (simple list without pagination)
    lookup: () => [...QUERY_KEYS.brands.all, 'lookup'] as const,
  },
  
  // Materials & Gemstones
  materials: {
    all: ['materials'] as const,
    lists: () => [...QUERY_KEYS.materials.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.materials.lists(), params] as const,
    details: () => [...QUERY_KEYS.materials.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.materials.details(), id] as const,
    lookup: () => [...QUERY_KEYS.materials.all, 'lookup'] as const,
  },
  
  // Gemstones - UPDATED
  gemstones: {
    all: ['gemstones'] as const,
    lists: () => [...QUERY_KEYS.gemstones.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.gemstones.lists(), params] as const,
    details: () => [...QUERY_KEYS.gemstones.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.gemstones.details(), id] as const,
    lookup: () => [...QUERY_KEYS.gemstones.all, 'lookup'] as const,
  },
  
  // Suppliers - NEW
  suppliers: {
    all: ['suppliers'] as const,
    lists: () => [...QUERY_KEYS.suppliers.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.suppliers.lists(), params] as const,
    details: () => [...QUERY_KEYS.suppliers.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.suppliers.details(), id] as const,
    // For product lookup (simple list without pagination)
    lookup: () => [...QUERY_KEYS.suppliers.all, 'lookup'] as const,
  },
};

note: be as modular as you can. follow solid principles, low level design should be best, system shhould be scallable.
