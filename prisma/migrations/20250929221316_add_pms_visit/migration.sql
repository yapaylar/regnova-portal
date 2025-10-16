-- CreateTable
CREATE TABLE "public"."PmsVisit" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT,
    "organization" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmsVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PmsVisit_facility_id_idx" ON "public"."PmsVisit"("facility_id");

-- CreateIndex
CREATE INDEX "PmsVisit_visit_date_idx" ON "public"."PmsVisit"("visit_date");

-- CreateIndex
CREATE INDEX "Device_registration_status_idx" ON "public"."Device"("registration_status");

-- AddForeignKey
ALTER TABLE "public"."PmsVisit" ADD CONSTRAINT "PmsVisit_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VerificationToken" ADD COLUMN "metadata" JSON;
