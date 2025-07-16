/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "logoUrl";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageUrl";
