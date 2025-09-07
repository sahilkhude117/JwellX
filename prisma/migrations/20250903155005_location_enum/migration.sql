-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "yearMonth" SET DEFAULT to_char(now(), 'YYYY-MM');
