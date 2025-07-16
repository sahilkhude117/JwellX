/*
  Warnings:

  - You are about to drop the column `code` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_code_key";

-- DropIndex
DROP INDEX "Category_shopId_code_key";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "Category_shopId_name_key" ON "Category"("shopId", "name");
