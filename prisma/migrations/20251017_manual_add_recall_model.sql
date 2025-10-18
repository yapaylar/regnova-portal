-- CreateEnum
CREATE TYPE "public"."RecallStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RecallActionType" AS ENUM ('SAFETY_NOTICE', 'FIELD_ACTION', 'FULL_RECALL', 'SOFTWARE_UPDATE');

-- AlterTable
ALTER TABLE "public"."VerificationToken" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "public"."Recall" (
    "id" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "device_id" TEXT,
    "title" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "public"."RecallStatus" NOT NULL,
    "action_type" "public"."RecallActionType" NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effective_start" TIMESTAMP(3),
    "effective_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Recall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recall_reference_key" ON "public"."Recall"("reference");

-- CreateIndex
CREATE INDEX "Recall_manufacturer_id_idx" ON "public"."Recall"("manufacturer_id");

-- CreateIndex
CREATE INDEX "Recall_device_id_idx" ON "public"."Recall"("device_id");

-- CreateIndex
CREATE INDEX "Recall_status_idx" ON "public"."Recall"("status");

-- CreateIndex
CREATE INDEX "Recall_action_type_idx" ON "public"."Recall"("action_type");

-- AddForeignKey
ALTER TABLE "public"."Recall" ADD CONSTRAINT "Recall_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recall" ADD CONSTRAINT "Recall_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

