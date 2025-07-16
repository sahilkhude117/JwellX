-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');

-- AlterTable
ALTER TABLE "Gemstone" ALTER COLUMN "defaultRate" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "defaultRate" SET DEFAULT 0;
