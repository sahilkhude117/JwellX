/*
  Warnings:

  - A unique constraint covering the columns `[shopId,contactNumber]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_shopId_contactNumber_key" ON "Supplier"("shopId", "contactNumber");
