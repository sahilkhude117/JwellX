/*
  Warnings:

  - Added the required column `buyingPrice` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "buyingPrice" DOUBLE PRECISION NOT NULL;
