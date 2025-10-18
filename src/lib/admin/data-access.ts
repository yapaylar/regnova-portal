import { Prisma, AuditEvent, ReportStatus, ReportType, DeviceAssignmentStatus, DeviceRegistrationStatus, DeviceClass, UserProfileType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

function normalizePagination({ page, pageSize }: PaginationOptions) {
  const normalizedPageSize = Math.min(Math.max(Number(pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const normalizedPage = Math.max(Number(page ?? 1) || 1, 1);
  const skip = (normalizedPage - 1) * normalizedPageSize;

  return { page: normalizedPage, pageSize: normalizedPageSize, skip };
}

function buildPaginationResult<T>(items: T[], total: number, page: number, pageSize: number): PaginationResult<T> {
  const consumed = (page - 1) * pageSize + items.length;
  const hasNextPage = consumed < total;
  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage,
  };
}

// Reports

export type AdminReportListFilters = {
  status?: ReportStatus;
  reportType?: ReportType;
  facilityId?: string;
  manufacturerId?: string;
  deviceId?: string;
  submittedAfter?: Date;
  submittedBefore?: Date;
  search?: string;
};

export type AdminReportListItem = {
  id: string;
  trackingId: string;
  reportType: ReportType;
  status: ReportStatus;
  summary: string | null;
  occurredAt: Date | null;
  createdAt: Date;
  submittedAt: Date | null;
  resolvedAt: Date | null;
  submitter: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  facility: {
    id: string;
    name: string;
    slug: string;
  } | null;
  manufacturer: {
    id: string;
    name: string;
    slug: string;
  } | null;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
  } | null;
};

export async function fetchAdminReportList(filters: AdminReportListFilters = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.ReportWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.reportType) {
    where.reportType = filters.reportType;
  }

  if (filters.facilityId) {
    where.facilityId = filters.facilityId;
  }

  if (filters.manufacturerId) {
    where.manufacturerId = filters.manufacturerId;
  }

  if (filters.deviceId) {
    where.deviceId = filters.deviceId;
  }

  if (filters.submittedAfter || filters.submittedBefore) {
    where.submittedAt = {
      gte: filters.submittedAfter ?? undefined,
      lte: filters.submittedBefore ?? undefined,
    };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { trackingId: { contains: searchTerm, mode: "insensitive" } },
        { summary: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  const select = {
    id: true,
    trackingId: true,
    reportType: true,
    status: true,
    summary: true,
    occurredAt: true,
    createdAt: true,
    submittedAt: true,
    resolvedAt: true,
    submittedBy: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    },
    facility: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    manufacturer: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    device: {
      select: {
        id: true,
        name: true,
        modelNumber: true,
      },
    },
  } satisfies Prisma.ReportSelect;

  const [total, reports] = await prisma.$transaction([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      select,
      orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  const items: AdminReportListItem[] = reports.map((report) => ({
    id: report.id,
    trackingId: report.trackingId,
    reportType: report.reportType,
    status: report.status,
    summary: report.summary,
    occurredAt: report.occurredAt,
    createdAt: report.createdAt,
    submittedAt: report.submittedAt,
    resolvedAt: report.resolvedAt,
    submitter: report.submittedBy
      ? {
          id: report.submittedBy.id,
          email: report.submittedBy.email,
          name: [report.submittedBy.firstName, report.submittedBy.lastName].filter(Boolean).join(" ") || null,
        }
      : null,
    facility: report.facility,
    manufacturer: report.manufacturer,
    device: report.device,
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

// Audit Log

export type AdminAuditLogFilters = {
  event?: AuditEvent;
  reportId?: string;
  userId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
};

export type AdminAuditLogItem = {
  id: string;
  event: AuditEvent;
  message: string;
  metadata: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  report: {
    id: string;
    trackingId: string;
  } | null;
};

export async function fetchAdminAuditLog(filters: AdminAuditLogFilters = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.AuditLogWhereInput = {};

  if (filters.event) {
    where.event = filters.event;
  }

  if (filters.reportId) {
    where.reportId = filters.reportId;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.createdAfter || filters.createdBefore) {
    where.createdAt = {
      gte: filters.createdAfter ?? undefined,
      lte: filters.createdBefore ?? undefined,
    };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [{ message: { contains: searchTerm, mode: "insensitive" } }];
    }
  }

  const select = {
    id: true,
    event: true,
    message: true,
    metadata: true,
    ipAddress: true,
    userAgent: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    },
    report: {
      select: {
        id: true,
        trackingId: true,
      },
    },
  } satisfies Prisma.AuditLogSelect;

  const [total, entries] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      select,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const items: AdminAuditLogItem[] = entries.map((entry) => ({
    id: entry.id,
    event: entry.event,
    message: entry.message,
    metadata: entry.metadata,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    createdAt: entry.createdAt,
    user: entry.user
      ? {
          id: entry.user.id,
          email: entry.user.email,
          name: [entry.user.firstName, entry.user.lastName].filter(Boolean).join(" ") || null,
        }
      : null,
    report: entry.report,
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

// Devices

export type AdminDeviceFilters = {
  manufacturerId?: string;
  facilityId?: string;
  registrationStatus?: DeviceRegistrationStatus;
  class?: DeviceClass;
  search?: string;
};

export type AdminDeviceListItem = {
  id: string;
  name: string;
  modelNumber: string | null;
  udi: string | null;
  registrationStatus: DeviceRegistrationStatus;
  deviceClass: DeviceClass;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  manufacturer: {
    id: string;
    name: string;
    slug: string;
  };
  assignments: Array<{
    id: string;
    status: DeviceAssignmentStatus;
    facility: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

export async function fetchAdminDeviceList(filters: AdminDeviceFilters = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.DeviceWhereInput = {};

  if (filters.manufacturerId) {
    where.manufacturerId = filters.manufacturerId;
  }

  if (filters.registrationStatus) {
    where.registrationStatus = filters.registrationStatus;
  }

  if (filters.class) {
    where.deviceClass = filters.class;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { modelNumber: { contains: searchTerm, mode: "insensitive" } },
        { udi: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  if (filters.facilityId) {
    where.assignments = {
      some: {
        facilityId: filters.facilityId,
      },
    };
  }

  const select = {
    id: true,
    name: true,
    modelNumber: true,
    udi: true,
    registrationStatus: true,
    deviceClass: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    manufacturer: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    assignments: {
      select: {
        id: true,
        status: true,
        facility: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  } satisfies Prisma.DeviceSelect;

  const [total, devices] = await prisma.$transaction([
    prisma.device.count({ where }),
    prisma.device.findMany({
      where,
      select,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const items: AdminDeviceListItem[] = devices.map((device) => ({
    ...device,
    notes: device.notes,
    assignments: device.assignments.map((assignment) => ({
      id: assignment.id,
      status: assignment.status,
      facility: assignment.facility,
    })),
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

export type CreateDeviceInput = {
  name: string;
  modelNumber?: string | null;
  manufacturerId: string;
  udi?: string | null;
  deviceClass: DeviceClass;
  registrationStatus: DeviceRegistrationStatus;
  notes?: string | null;
  assignments?: Array<{
    facilityId: string;
    status: DeviceAssignmentStatus;
    notes?: string | null;
  }>;
};

export type CreateDeviceResult = {
  device: Prisma.DeviceGetPayload<{
    include: {
      manufacturer: true;
      assignments: {
        include: { facility: true };
      };
    };
  }>;
};

export async function createAdminDevice(input: CreateDeviceInput, adminUserId: string): Promise<CreateDeviceResult> {
  return prisma.$transaction(async (tx) => {
    const createdDevice = await tx.device.create({
      data: {
        name: input.name,
        modelNumber: input.modelNumber ?? null,
        manufacturerId: input.manufacturerId,
        udi: input.udi ?? null,
        deviceClass: input.deviceClass,
        registrationStatus: input.registrationStatus,
        notes: input.notes ?? null,
      },
    });

    if (input.assignments && input.assignments.length > 0) {
      for (const assignment of input.assignments) {
        await tx.deviceAssignment.create({
          data: {
            deviceId: createdDevice.id,
            facilityId: assignment.facilityId,
            status: assignment.status,
            notes: assignment.notes ?? null,
          },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        user: {
          connect: { id: adminUserId },
        },
        event: "REPORT_CREATED",
        message: `Device ${createdDevice.name} created`,
        metadata: {
          name: createdDevice.name,
          manufacturerId: createdDevice.manufacturerId,
          assignments: input.assignments?.length ?? 0,
        },
      },
    });

    const deviceWithRelations = await tx.device.findUniqueOrThrow({
      where: { id: createdDevice.id },
      include: {
        manufacturer: true,
        assignments: {
          include: {
            facility: true,
          },
        },
      },
    });

    return { device: deviceWithRelations };
  });
}

// PMS Visits

export type AdminPmsFilters = {
  facilityId?: string;
  visitAfter?: Date;
  visitBefore?: Date;
  search?: string;
};

export type AdminPmsListItem = {
  id: string;
  organization: string;
  visitDate: Date;
  notes: string;
  attachments: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  facility: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function fetchAdminPmsVisits(filters: AdminPmsFilters = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.PmsVisitWhereInput = {};

  if (filters.facilityId) {
    where.facilityId = filters.facilityId;
  }

  if (filters.visitAfter || filters.visitBefore) {
    where.visitDate = {
      gte: filters.visitAfter ?? undefined,
      lte: filters.visitBefore ?? undefined,
    };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { organization: { contains: searchTerm, mode: "insensitive" } },
        { notes: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  const select = {
    id: true,
    organization: true,
    visitDate: true,
    notes: true,
    attachments: true,
    createdAt: true,
    updatedAt: true,
    facility: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
  } satisfies Prisma.PmsVisitSelect;

  const [total, visits] = await prisma.$transaction([
    prisma.pmsVisit.count({ where }),
    prisma.pmsVisit.findMany({
      where,
      select,
      orderBy: { visitDate: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const items: AdminPmsListItem[] = visits.map((visit) => ({
    ...visit,
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

export type CreatePmsVisitInput = {
  facilityId?: string | null;
  organization: string;
  visitDate: Date;
  notes: string;
  attachments?: string[];
};

export type CreatePmsVisitResult = {
  visit: Prisma.PmsVisitGetPayload<{
    include: {
      facility: true;
    };
  }>;
};

export async function createAdminPmsVisit(input: CreatePmsVisitInput, adminUserId: string): Promise<CreatePmsVisitResult> {
  return prisma.$transaction(async (tx) => {
    const visit = await tx.pmsVisit.create({
      data: {
        facilityId: input.facilityId ?? null,
        organization: input.organization,
        visitDate: input.visitDate,
        notes: input.notes,
        attachments: input.attachments ?? [],
      },
      include: {
        facility: true,
      },
    });

    await tx.auditLog.create({
      data: {
        user: {
          connect: { id: adminUserId },
        },
        event: "REPORT_UPDATED",
        message: `PMS visit logged for ${visit.organization}`,
        metadata: {
          facilityId: visit.facilityId,
          visitDate: visit.visitDate,
        },
      },
    });

    return { visit };
  });
}

// Users

export type AdminUserFilters = {
  profileType?: UserProfileType;
  isActive?: boolean;
  search?: string;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  emailNormalized: string;
  firstName: string | null;
  lastName: string | null;
  organization: string | null;
  profileType: UserProfileType;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  facilityProfile: {
    facility: {
      id: string;
      name: string;
      slug: string;
    };
    title: string | null;
    department: string | null;
  } | null;
  manufacturerProfile: {
    manufacturer: {
      id: string;
      name: string;
      slug: string;
    };
    jobTitle: string | null;
  } | null;
};

export async function fetchAdminUserList(filters: AdminUserFilters = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.UserWhereInput = {};

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  if (filters.profileType) {
    where.profileType = filters.profileType;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { email: { contains: searchTerm, mode: "insensitive" } },
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { organization: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  const select = {
    id: true,
    email: true,
    emailNormalized: true,
    firstName: true,
    lastName: true,
    organization: true,
    profileType: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    facilityProfile: {
      select: {
        title: true,
        department: true,
        facility: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
    manufacturerProfile: {
      select: {
        jobTitle: true,
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  } satisfies Prisma.UserSelect;

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const items: AdminUserListItem[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    emailNormalized: user.emailNormalized,
    firstName: user.firstName,
    lastName: user.lastName,
    organization: user.organization,
    profileType: user.profileType,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    facilityProfile: user.facilityProfile
      ? {
          title: user.facilityProfile.title,
          department: user.facilityProfile.department,
          facility: user.facilityProfile.facility,
        }
      : null,
    manufacturerProfile: user.manufacturerProfile
      ? {
          jobTitle: user.manufacturerProfile.jobTitle,
          manufacturer: user.manufacturerProfile.manufacturer,
        }
      : null,
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

// Manufacturer & Facility Registrations (Approval Flow)

export type ManufacturerRegistrationListItem = {
  id: string;
  userId: string;
  manufacturerId: string | null;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  manufacturer: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function fetchAdminManufacturerRegistrations(filters: { status?: string } = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);
  const where: Prisma.ManufacturerRegistrationWhereInput = filters.status ? { status: filters.status as any } : {};

  const [items, total] = await Promise.all([
    prisma.manufacturerRegistration.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        manufacturer: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.manufacturerRegistration.count({ where }),
  ]);

  return buildPaginationResult(items, total, page, pageSize);
}

export async function approveManufacturerRegistration(registrationId: string, adminUserId: string, notes?: string) {
  const registration = await prisma.manufacturerRegistration.findUnique({
    where: { id: registrationId },
    include: { user: true },
  });

  if (!registration) throw new Error("Registration not found");
  if (registration.status !== "PENDING") throw new Error("Registration already processed");

  await prisma.$transaction(async (tx) => {
    await tx.manufacturerRegistration.update({
      where: { id: registrationId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: adminUserId, reviewNotes: notes },
    });

    if (registration.manufacturerId) {
      await tx.user.update({
        where: { id: registration.userId },
        data: {
          manufacturerProfile: {
            create: {
              manufacturerId: registration.manufacturerId,
              jobTitle: (registration.metadata as any)?.jobTitle ?? null,
            },
          },
        },
      });
    }

    await tx.auditLog.create({
      data: {
        event: "MANUFACTURER_REGISTRATION_APPROVED" as AuditEvent,
        userId: adminUserId,
        metadata: { registrationId, targetUserId: registration.userId },
      },
    });
  });
}

export async function rejectManufacturerRegistration(registrationId: string, adminUserId: string, notes?: string) {
  const registration = await prisma.manufacturerRegistration.findUnique({ where: { id: registrationId } });
  if (!registration) throw new Error("Registration not found");
  if (registration.status !== "PENDING") throw new Error("Registration already processed");

  await prisma.$transaction(async (tx) => {
    await tx.manufacturerRegistration.update({
      where: { id: registrationId },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: adminUserId, reviewNotes: notes },
    });

    await tx.auditLog.create({
      data: {
        event: "MANUFACTURER_REGISTRATION_REJECTED" as AuditEvent,
        userId: adminUserId,
        metadata: { registrationId, targetUserId: registration.userId },
      },
    });
  });
}

export async function fetchManufacturerOptions() {
  const manufacturers = await prisma.manufacturer.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  return manufacturers.map((m) => ({ value: m.id, label: m.name }));
}

export type FacilityRegistrationListItem = {
  id: string;
  userId: string;
  facilityId: string | null;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  facility: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function fetchAdminFacilityRegistrations(filters: { status?: string } = {}, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);
  const where: Prisma.FacilityRegistrationWhereInput = filters.status ? { status: filters.status as any } : {};

  const [items, total] = await Promise.all([
    prisma.facilityRegistration.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        facility: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.facilityRegistration.count({ where }),
  ]);

  return buildPaginationResult(items, total, page, pageSize);
}

export async function approveFacilityRegistration(registrationId: string, adminUserId: string, notes?: string) {
  const registration = await prisma.facilityRegistration.findUnique({
    where: { id: registrationId },
    include: { user: true },
  });

  if (!registration) throw new Error("Registration not found");
  if (registration.status !== "PENDING") throw new Error("Registration already processed");

  await prisma.$transaction(async (tx) => {
    await tx.facilityRegistration.update({
      where: { id: registrationId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: adminUserId, reviewNotes: notes },
    });

    if (registration.facilityId) {
      await tx.user.update({
        where: { id: registration.userId },
        data: {
          facilityProfile: {
            create: {
              facilityId: registration.facilityId,
              department: (registration.metadata as any)?.department ?? null,
              jobTitle: (registration.metadata as any)?.jobTitle ?? null,
            },
          },
        },
      });
    }

    await tx.auditLog.create({
      data: {
        event: "FACILITY_REGISTRATION_APPROVED" as AuditEvent,
        userId: adminUserId,
        metadata: { registrationId, targetUserId: registration.userId },
      },
    });
  });
}

export async function rejectFacilityRegistration(registrationId: string, adminUserId: string, notes?: string) {
  const registration = await prisma.facilityRegistration.findUnique({ where: { id: registrationId } });
  if (!registration) throw new Error("Registration not found");
  if (registration.status !== "PENDING") throw new Error("Registration already processed");

  await prisma.$transaction(async (tx) => {
    await tx.facilityRegistration.update({
      where: { id: registrationId },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: adminUserId, reviewNotes: notes },
    });

    await tx.auditLog.create({
      data: {
        event: "FACILITY_REGISTRATION_REJECTED" as AuditEvent,
        userId: adminUserId,
        metadata: { registrationId, targetUserId: registration.userId },
      },
    });
  });
}

export async function fetchFacilityOptions() {
  const facilities = await prisma.facility.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  return facilities.map((f) => ({ value: f.id, label: f.name }));
}
