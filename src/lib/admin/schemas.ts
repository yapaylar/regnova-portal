import {
  AuditEvent,
  DeviceAssignmentStatus,
  DeviceClass,
  DeviceRegistrationStatus,
  ReportStatus,
  ReportType,
  UserProfileType,
} from "@prisma/client";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

export const adminReportQuerySchema = paginationSchema
  .extend({
    status: z.nativeEnum(ReportStatus).optional(),
    reportType: z.nativeEnum(ReportType).optional(),
    facilityId: z.string().min(1).optional(),
    manufacturerId: z.string().min(1).optional(),
    deviceId: z.string().min(1).optional(),
    submittedAfter: z.coerce.date().optional(),
    submittedBefore: z.coerce.date().optional(),
    search: z.string().optional(),
  })
  .strict();

export const adminAuditLogQuerySchema = paginationSchema
  .extend({
    event: z.nativeEnum(AuditEvent).optional(),
    reportId: z.string().min(1).optional(),
    userId: z.string().min(1).optional(),
    createdAfter: z.coerce.date().optional(),
    createdBefore: z.coerce.date().optional(),
    search: z.string().optional(),
  })
  .strict();

export const adminDevicesQuerySchema = paginationSchema
  .extend({
    manufacturerId: z.string().min(1).optional(),
    facilityId: z.string().min(1).optional(),
    registrationStatus: z.nativeEnum(DeviceRegistrationStatus).optional(),
    class: z.nativeEnum(DeviceClass).optional(),
    search: z.string().optional(),
  })
  .strict();

export const adminDevicesCreateSchema = z
  .object({
    name: z.string().min(2),
    modelNumber: z.string().optional().nullable(),
    manufacturerId: z.string().min(1),
    udi: z.string().optional().nullable(),
    deviceClass: z.nativeEnum(DeviceClass),
    registrationStatus: z.nativeEnum(DeviceRegistrationStatus),
    notes: z.string().optional().nullable(),
    assignments: z
      .array(
        z.object({
          facilityId: z.string().min(1),
          status: z.nativeEnum(DeviceAssignmentStatus),
          notes: z.string().optional().nullable(),
        }),
      )
      .optional(),
  })
  .strict();

export const adminPmsQuerySchema = paginationSchema
  .extend({
    facilityId: z.string().min(1).optional(),
    visitAfter: z.coerce.date().optional(),
    visitBefore: z.coerce.date().optional(),
    search: z.string().optional(),
  })
  .strict();

export const adminPmsCreateSchema = z
  .object({
    facilityId: z.string().min(1).optional().nullable(),
    organization: z.string().min(2),
    visitDate: z.coerce.date(),
    notes: z.string().min(5),
    attachments: z.array(z.string().min(1)).optional(),
  })
  .strict();

export const adminUsersQuerySchema = paginationSchema
  .extend({
    profileType: z.nativeEnum(UserProfileType).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().optional(),
  })
  .strict();

export const adminManufacturerRegistrationQuerySchema = paginationSchema
  .extend({
    status: z.string().optional(),
  })
  .strict();

export const adminFacilityRegistrationQuerySchema = paginationSchema
  .extend({
    status: z.string().optional(),
  })
  .strict();

export type AdminReportQuery = z.infer<typeof adminReportQuerySchema>;
export type AdminAuditLogQuery = z.infer<typeof adminAuditLogQuerySchema>;
export type AdminDevicesQuery = z.infer<typeof adminDevicesQuerySchema>;
export type AdminPmsQuery = z.infer<typeof adminPmsQuerySchema>;
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminManufacturerRegistrationQuery = z.infer<typeof adminManufacturerRegistrationQuerySchema>;
export type AdminFacilityRegistrationQuery = z.infer<typeof adminFacilityRegistrationQuerySchema>;

