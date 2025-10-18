import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export const facilityDeviceQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).optional(),
  })
  .strict();

export type FacilityDeviceQuery = z.infer<typeof facilityDeviceQuerySchema>;

export const facilityReportQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    status: z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "ACTION_REQUIRED", "RESOLVED", "CLOSED"]).optional(),
    reportType: z.enum(["COMPLAINT", "ADVERSE_EVENT"]).optional(),
  })
  .strict();

export type FacilityReportQuery = z.infer<typeof facilityReportQuerySchema>;

export const facilityRecallQuerySchema = paginationSchema
  .extend({
    search: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
    actionType: z.enum(["RECALL", "SAFETY_ALERT", "FIELD_CORRECTION", "MARKET_WITHDRAWAL"]).optional(),
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

