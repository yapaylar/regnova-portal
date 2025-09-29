-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserProfileType" AS ENUM ('ADMIN', 'FACILITY', 'MANUFACTURER');

-- CreateEnum
CREATE TYPE "public"."DeviceClass" AS ENUM ('I', 'II', 'III');

-- CreateEnum
CREATE TYPE "public"."DeviceRegistrationStatus" AS ENUM ('REGISTERED', 'PENDING', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."DeviceAssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETURNED');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('COMPLAINT', 'ADVERSE_EVENT');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."AuditEvent" AS ENUM ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_SIGNUP', 'AUTH_PASSWORD_RESET', 'AUTH_TOKEN_REFRESH', 'AUTH_LOGOUT', 'REPORT_CREATED', 'REPORT_UPDATED', 'REPORT_STATUS_CHANGED');

-- CreateEnum
CREATE TYPE "public"."VerificationType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET', 'INVITE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_normalized" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "organization" TEXT,
    "profile_type" "public"."UserProfileType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'bcrypt',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "fingerprint" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Facility" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "address" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FacilityProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Manufacturer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_number" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ManufacturerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "job_title" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManufacturerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "id" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model_number" TEXT,
    "udi" TEXT,
    "device_class" "public"."DeviceClass" NOT NULL,
    "registration_status" "public"."DeviceRegistrationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeviceAssignment" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "status" "public"."DeviceAssignmentStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "report_type" "public"."ReportType" NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_by_id" TEXT,
    "facility_id" TEXT,
    "manufacturer_id" TEXT,
    "device_id" TEXT,
    "occurred_at" TIMESTAMP(3),
    "summary" TEXT,
    "details" JSONB,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "report_id" TEXT,
    "event" "public"."AuditEvent" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."VerificationType" NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_normalized_key" ON "public"."User"("email_normalized");

-- CreateIndex
CREATE INDEX "User_email_normalized_idx" ON "public"."User"("email_normalized");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordCredential_userId_key" ON "public"."PasswordCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_revoked_at_idx" ON "public"."RefreshToken"("userId", "revoked_at");

-- CreateIndex
CREATE INDEX "RefreshToken_token_revoked_at_idx" ON "public"."RefreshToken"("token", "revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_slug_key" ON "public"."Facility"("slug");

-- CreateIndex
CREATE INDEX "Facility_slug_idx" ON "public"."Facility"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityProfile_userId_key" ON "public"."FacilityProfile"("userId");

-- CreateIndex
CREATE INDEX "FacilityProfile_facility_id_idx" ON "public"."FacilityProfile"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_slug_key" ON "public"."Manufacturer"("slug");

-- CreateIndex
CREATE INDEX "Manufacturer_slug_idx" ON "public"."Manufacturer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturerProfile_userId_key" ON "public"."ManufacturerProfile"("userId");

-- CreateIndex
CREATE INDEX "ManufacturerProfile_manufacturer_id_idx" ON "public"."ManufacturerProfile"("manufacturer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Device_udi_key" ON "public"."Device"("udi");

-- CreateIndex
CREATE INDEX "Device_manufacturer_id_idx" ON "public"."Device"("manufacturer_id");

-- CreateIndex
CREATE INDEX "Device_device_class_idx" ON "public"."Device"("device_class");

-- CreateIndex
CREATE INDEX "DeviceAssignment_facility_id_idx" ON "public"."DeviceAssignment"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceAssignment_device_id_facility_id_key" ON "public"."DeviceAssignment"("device_id", "facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_tracking_id_key" ON "public"."Report"("tracking_id");

-- CreateIndex
CREATE INDEX "Report_facility_id_idx" ON "public"."Report"("facility_id");

-- CreateIndex
CREATE INDEX "Report_manufacturer_id_idx" ON "public"."Report"("manufacturer_id");

-- CreateIndex
CREATE INDEX "Report_device_id_idx" ON "public"."Report"("device_id");

-- CreateIndex
CREATE INDEX "Report_report_type_idx" ON "public"."Report"("report_type");

-- CreateIndex
CREATE INDEX "AuditLog_event_idx" ON "public"."AuditLog"("event");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "public"."AuditLog"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_user_id_type_idx" ON "public"."VerificationToken"("user_id", "type");

-- AddForeignKey
ALTER TABLE "public"."PasswordCredential" ADD CONSTRAINT "PasswordCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacilityProfile" ADD CONSTRAINT "FacilityProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacilityProfile" ADD CONSTRAINT "FacilityProfile_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManufacturerProfile" ADD CONSTRAINT "ManufacturerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManufacturerProfile" ADD CONSTRAINT "ManufacturerProfile_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeviceAssignment" ADD CONSTRAINT "DeviceAssignment_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeviceAssignment" ADD CONSTRAINT "DeviceAssignment_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VerificationToken" ADD CONSTRAINT "VerificationToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


