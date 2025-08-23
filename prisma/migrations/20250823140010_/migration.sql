/*
  Warnings:

  - The values [SOLD,RESERVED,DAMAGED,LOST] on the enum `InventoryItemStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InventoryItemStatus_new" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK');
ALTER TABLE "InventoryItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "InventoryItem" ALTER COLUMN "status" TYPE "InventoryItemStatus_new" USING ("status"::text::"InventoryItemStatus_new");
ALTER TYPE "InventoryItemStatus" RENAME TO "InventoryItemStatus_old";
ALTER TYPE "InventoryItemStatus_new" RENAME TO "InventoryItemStatus";
DROP TYPE "InventoryItemStatus_old";
ALTER TABLE "InventoryItem" ALTER COLUMN "status" SET DEFAULT 'IN_STOCK';
COMMIT;

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');
