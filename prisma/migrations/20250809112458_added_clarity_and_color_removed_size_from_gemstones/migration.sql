/*
  Warnings:

  - You are about to drop the column `size` on the `Gemstone` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopId,name,shape,clarity,color]` on the table `Gemstone` will be added. If there are existing duplicate values, this will fail.
  - Made the column `clarity` on table `Gemstone` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `Gemstone` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Gemstone_shopId_name_shape_size_key";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "Gemstone" DROP COLUMN "size",
ALTER COLUMN "clarity" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Gemstone_shopId_name_shape_clarity_color_key" ON "Gemstone"("shopId", "name", "shape", "clarity", "color");
