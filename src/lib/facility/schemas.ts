import { DeviceAssignmentStatus, RecallActionType, RecallStatus, ReportStatus, ReportType } from "@prisma/client";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export const facilityDeviceQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    status: z.nativeEnum(DeviceAssignmentStatus).optional(),
  })
  .strict();

export type FacilityDeviceQuery = z.infer<typeof facilityDeviceQuerySchema>;

export const facilityReportQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    status: z.nativeEnum(ReportStatus).optional(),
    reportType: z.nativeEnum(ReportType).optional(),
  })
  .strict();

export type FacilityReportQuery = z.infer<typeof facilityReportQuerySchema>;

export const facilityRecallQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    status: z.nativeEnum(RecallStatus).optional(),
    actionType: z.nativeEnum(RecallActionType).optional(),
  })
  .strict();

export type FacilityRecallQuery = z.infer<typeof facilityRecallQuerySchema>;

export const facilityResourceQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    type: z.string().optional(),
  })
  .strict();

export type FacilityResourceQuery = z.infer<typeof facilityResourceQuerySchema>;

