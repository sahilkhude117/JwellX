/*
  Warnings:

  - The `gender` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `location` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `occasion` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `style` column on the `InventoryItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InventoryLocation" AS ENUM ('MAIN_SHOWROOM', 'WAREHOUSE', 'ONLINE_STORE', 'BRANCH_1', 'BRANCH_2', 'STORAGE_ROOM');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'BOYS', 'GIRLS');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('WEDDING', 'FESTIVAL', 'CASUAL', 'PARTY', 'ENGAGEMENT', 'ANNIVERSARY', 'BIRTHDAY', 'DAILY_WEAR');

-- CreateEnum
CREATE TYPE "Style" AS ENUM ('TRADITIONAL', 'MODERN', 'CONTEMPORARY', 'ETHNIC', 'WESTERN', 'FUSION', 'MINIMALIST', 'STATEMENT');

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender",
DROP COLUMN "location",
ADD COLUMN     "location" "InventoryLocation",
DROP COLUMN "occasion",
ADD COLUMN     "occasion" "Occasion",
DROP COLUMN "style",
ADD COLUMN     "style" "Style";
