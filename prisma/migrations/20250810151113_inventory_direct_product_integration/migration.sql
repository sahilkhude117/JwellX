/*
  Warnings:

  - You are about to drop the column `category` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemCode` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `purity` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `InventoryItem` table. All the data in the column will be lost.
  - The `status` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `created` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantGemstone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantMaterial` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sku]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossWeight` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InventoryItemStatus" AS ENUM ('IN_STOCK', 'SOLD', 'RESERVED', 'DAMAGED', 'LOST');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_shopId_fkey";

-- DropForeignKey
ALTER TABLE "ProductAttribute" DROP CONSTRAINT "ProductAttribute_productId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "VariantGemstone" DROP CONSTRAINT "VariantGemstone_gemstoneId_fkey";

-- DropForeignKey
ALTER TABLE "VariantGemstone" DROP CONSTRAINT "VariantGemstone_variantId_fkey";

-- DropForeignKey
ALTER TABLE "VariantMaterial" DROP CONSTRAINT "VariantMaterial_materialId_fkey";

-- DropForeignKey
ALTER TABLE "VariantMaterial" DROP CONSTRAINT "VariantMaterial_variantId_fkey";

-- DropIndex
DROP INDEX "InventoryItem_shopId_category_status_idx";

-- DropIndex
DROP INDEX "InventoryItem_shopId_status_idx";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "category",
DROP COLUMN "costPrice",
DROP COLUMN "itemCode",
DROP COLUMN "purity",
DROP COLUMN "weight",
ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "grossWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "isRawMaterial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "occasion" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "style" TEXT,
ADD COLUMN     "supplierId" TEXT,
ADD COLUMN     "updatedById" TEXT NOT NULL,
ADD COLUMN     "wastage" DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "InventoryItemStatus" NOT NULL DEFAULT 'IN_STOCK';

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "created",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductAttribute";

-- DropTable
DROP TABLE "Variant";

-- DropTable
DROP TABLE "VariantGemstone";

-- DropTable
DROP TABLE "VariantMaterial";

-- DropEnum
DROP TYPE "ItemStatus";

-- DropEnum
DROP TYPE "JewelryCategory";

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shopId" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItemMaterial" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "buyingPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InventoryItemMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItemGemstone" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "gemstoneId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "buyingPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InventoryItemGemstone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "adjustment" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseHistory" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseHistoryItem" (
    "id" TEXT NOT NULL,
    "purchaseHistoryId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseHistoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Supplier_shopId_idx" ON "Supplier"("shopId");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "InventoryItemMaterial_materialId_idx" ON "InventoryItemMaterial"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItemMaterial_inventoryItemId_materialId_key" ON "InventoryItemMaterial"("inventoryItemId", "materialId");

-- CreateIndex
CREATE INDEX "InventoryItemGemstone_gemstoneId_idx" ON "InventoryItemGemstone"("gemstoneId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItemGemstone_inventoryItemId_gemstoneId_key" ON "InventoryItemGemstone"("inventoryItemId", "gemstoneId");

-- CreateIndex
CREATE INDEX "StockAdjustment_inventoryItemId_createdAt_idx" ON "StockAdjustment"("inventoryItemId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StockAdjustment_shopId_createdAt_idx" ON "StockAdjustment"("shopId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StockAdjustment_shopId_userId_createdAt_idx" ON "StockAdjustment"("shopId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "PurchaseHistory_shopId_purchaseDate_idx" ON "PurchaseHistory"("shopId", "purchaseDate" DESC);

-- CreateIndex
CREATE INDEX "PurchaseHistory_shopId_supplierId_idx" ON "PurchaseHistory"("shopId", "supplierId");

-- CreateIndex
CREATE INDEX "PurchaseHistoryItem_purchaseHistoryId_idx" ON "PurchaseHistoryItem"("purchaseHistoryId");

-- CreateIndex
CREATE INDEX "PurchaseHistoryItem_inventoryItemId_idx" ON "PurchaseHistoryItem"("inventoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- CreateIndex
CREATE INDEX "InventoryItem_shopId_status_createdAt_idx" ON "InventoryItem"("shopId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryItem_shopId_categoryId_status_idx" ON "InventoryItem"("shopId", "categoryId", "status");

-- CreateIndex
CREATE INDEX "InventoryItem_shopId_brandId_status_idx" ON "InventoryItem"("shopId", "brandId", "status");

-- CreateIndex
CREATE INDEX "InventoryItem_shopId_supplierId_idx" ON "InventoryItem"("shopId", "supplierId");

-- CreateIndex
CREATE INDEX "InventoryItem_isRawMaterial_status_idx" ON "InventoryItem"("isRawMaterial", "status");

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemMaterial" ADD CONSTRAINT "InventoryItemMaterial_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemMaterial" ADD CONSTRAINT "InventoryItemMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemGemstone" ADD CONSTRAINT "InventoryItemGemstone_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemGemstone" ADD CONSTRAINT "InventoryItemGemstone_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "Gemstone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistory" ADD CONSTRAINT "PurchaseHistory_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistory" ADD CONSTRAINT "PurchaseHistory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistory" ADD CONSTRAINT "PurchaseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistoryItem" ADD CONSTRAINT "PurchaseHistoryItem_purchaseHistoryId_fkey" FOREIGN KEY ("purchaseHistoryId") REFERENCES "PurchaseHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistoryItem" ADD CONSTRAINT "PurchaseHistoryItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
