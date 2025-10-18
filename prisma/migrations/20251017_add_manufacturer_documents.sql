-- CreateTable
CREATE TABLE "public"."DocumentFolder" (
    "id" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentFile" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "device_id" TEXT,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "version" TEXT,
    "uploaded_by" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "DocumentFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentFolder_manufacturer_id_idx" ON "public"."DocumentFolder"("manufacturer_id");

-- CreateIndex
CREATE INDEX "DocumentFile_folder_id_idx" ON "public"."DocumentFile"("folder_id");

-- CreateIndex
CREATE INDEX "DocumentFile_device_id_idx" ON "public"."DocumentFile"("device_id");

-- CreateIndex
CREATE INDEX "DocumentFile_title_idx" ON "public"."DocumentFile"("title");

-- AddForeignKey
ALTER TABLE "public"."DocumentFolder" ADD CONSTRAINT "DocumentFolder_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentFile" ADD CONSTRAINT "DocumentFile_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."DocumentFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentFile" ADD CONSTRAINT "DocumentFile_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

