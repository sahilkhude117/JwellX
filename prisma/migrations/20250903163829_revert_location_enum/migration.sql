/*
  Warnings:

  - You are about to drop the column `buyingPrice` on the `InventoryItem` table. All the data in the column will be lost.
  - The `gender` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `location` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `occasion` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `style` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "buyingPrice",
DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT,
DROP COLUMN "location",
ADD COLUMN     "location" TEXT,
DROP COLUMN "occasion",
ADD COLUMN     "occasion" TEXT,
DROP COLUMN "style",
ADD COLUMN     "style" TEXT;

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "InventoryLocation";

-- DropEnum
DROP TYPE "Occasion";

-- DropEnum
DROP TYPE "Style";
