import { DeviceClass, DeviceRegistrationStatus, RecallActionType, RecallStatus, ReportStatus, ReportType } from "@prisma/client";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export const manufacturerProductQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
  })
  .strict();

export const manufacturerProductCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required"),
    modelNumber: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    udi: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    deviceClass: z.nativeEnum(DeviceClass),
    registrationStatus: z.nativeEnum(DeviceRegistrationStatus),
  })
  .strict();

export type ManufacturerProductQuery = z.infer<typeof manufacturerProductQuerySchema>;
export type ManufacturerProductCreateInput = z.infer<typeof manufacturerProductCreateSchema>;

export const manufacturerReportQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
    status: z.nativeEnum(ReportStatus).optional(),
    reportType: z.nativeEnum(ReportType).optional(),
  })
  .strict();

export type ManufacturerReportQuery = z.infer<typeof manufacturerReportQuerySchema>;

export const manufacturerRecallQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
    status: z.nativeEnum(RecallStatus).optional(),
    actionType: z.nativeEnum(RecallActionType).optional(),
    region: z.string().trim().max(80).optional(),
  })
  .strict();

export type ManufacturerRecallQuery = z.infer<typeof manufacturerRecallQuerySchema>;

export const manufacturerDocumentQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
    deviceId: z.string().cuid().optional(),
    folderId: z.string().cuid().optional(),
  })
  .strict();

export type ManufacturerDocumentQuery = z.infer<typeof manufacturerDocumentQuerySchema>;

export const manufacturerDocumentFolderQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().max(120).optional(),
  })
  .strict();

export type ManufacturerDocumentFolderQuery = z.infer<typeof manufacturerDocumentFolderQuerySchema>;

