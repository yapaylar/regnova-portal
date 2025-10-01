-- AlterTable
ALTER TABLE "Device" ADD COLUMN "notes" TEXT;

-- Since we now reference Device from AuditLog, ensure column exists before seeding
