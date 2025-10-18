import { Prisma, DeviceAssignmentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

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

export type FacilityDeviceFilters = {
  facilityId: string;
  search?: string;
  status?: DeviceAssignmentStatus;
};

export type FacilityDeviceListItem = {
  assignmentId: string;
  status: DeviceAssignmentStatus;
  notes: string | null;
  assignedAt: Date;
  updatedAt: Date;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    udi: string | null;
    deviceClass: string;
    registrationStatus: string;
    manufacturer: {
      id: string;
      name: string;
    };
  };
  reportsCount: number;
  activeRecalls: number;
};

export async function fetchFacilityDeviceList(filters: FacilityDeviceFilters, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  // If no facilityId, return empty result (pending approval)
  if (!filters.facilityId) {
    return buildPaginationResult([], 0, page, pageSize);
  }

  const where: Prisma.DeviceAssignmentWhereInput = {
    facilityId: filters.facilityId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.device = {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { modelNumber: { contains: searchTerm, mode: "insensitive" } },
          { udi: { contains: searchTerm, mode: "insensitive" } },
          { manufacturer: { name: { contains: searchTerm, mode: "insensitive" } } },
        ],
      };
    }
  }

  const select = {
    id: true,
    status: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    device: {
      select: {
        id: true,
        name: true,
        modelNumber: true,
        udi: true,
        deviceClass: true,
        registrationStatus: true,
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  } satisfies Prisma.DeviceAssignmentSelect;

  const [total, assignments] = await prisma.$transaction([
    prisma.deviceAssignment.count({ where }),
    prisma.deviceAssignment.findMany({
      where,
      select,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  const deviceIds = assignments.map((assignment) => assignment.device.id);

  const [reportGroups, recallGroups] = await Promise.all([
    deviceIds.length > 0
      ? prisma.report.groupBy({
          by: ["deviceId"],
          where: {
            deviceId: { in: deviceIds },
            facilityId: filters.facilityId,
            status: { notIn: ["DRAFT"] },
          },
          _count: true,
        })
      : Promise.resolve([]),
    // TODO: Add recall grouping when Recall model is available
    Promise.resolve([]),
  ]);

  const reportCountMap = new Map<string, number>();
  for (const group of reportGroups) {
    if (group.deviceId) {
      reportCountMap.set(group.deviceId, group._count);
    }
  }

  // Recall count will be implemented when Recall model is added
  const recallCountMap = new Map<string, number>();

  const items: FacilityDeviceListItem[] = assignments.map((assignment) => ({
    assignmentId: assignment.id,
    status: assignment.status,
    notes: assignment.notes ?? null,
    assignedAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    device: {
      id: assignment.device.id,
      name: assignment.device.name,
      modelNumber: assignment.device.modelNumber,
      udi: assignment.device.udi,
      deviceClass: assignment.device.deviceClass,
      registrationStatus: assignment.device.registrationStatus,
      manufacturer: {
        id: assignment.device.manufacturer.id,
        name: assignment.device.manufacturer.name,
      },
    },
    reportsCount: reportCountMap.get(assignment.device.id) ?? 0,
    activeRecalls: recallCountMap.get(assignment.device.id) ?? 0,
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

// Get all available devices (not yet assigned to facility)
export type AvailableDeviceListItem = {
  id: string;
  name: string;
  modelNumber: string | null;
  udi: string | null;
  deviceClass: string;
  registrationStatus: string;
  manufacturer: {
    id: string;
    name: string;
  };
  isAssigned: boolean;
};

export async function fetchAvailableDevices(facilityId: string, search?: string) {
  const where: Prisma.DeviceWhereInput = {
    registrationStatus: "REGISTERED", // Only show registered devices
  };

  if (search) {
    const searchTerm = search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { modelNumber: { contains: searchTerm, mode: "insensitive" } },
        { udi: { contains: searchTerm, mode: "insensitive" } },
        { manufacturer: { name: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }
  }

  const [devices, assignments] = await Promise.all([
    prisma.device.findMany({
      where,
      select: {
        id: true,
        name: true,
        modelNumber: true,
        udi: true,
        deviceClass: true,
        registrationStatus: true,
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: 100, // Limit for performance
    }),
    prisma.deviceAssignment.findMany({
      where: { facilityId },
      select: { deviceId: true },
    }),
  ]);

  const assignedDeviceIds = new Set(assignments.map((a) => a.deviceId));

  return devices.map((device) => ({
    ...device,
    manufacturer: device.manufacturer,
    isAssigned: assignedDeviceIds.has(device.id),
  }));
}

// Assign device to facility
export async function assignDeviceToFacility(facilityId: string, deviceId: string, notes?: string) {
  // Check if already assigned
  const existing = await prisma.deviceAssignment.findUnique({
    where: {
      deviceId_facilityId: {
        deviceId,
        facilityId,
      },
    },
  });

  if (existing) {
    throw new Error("Device already assigned to this facility");
  }

  return prisma.deviceAssignment.create({
    data: {
      deviceId,
      facilityId,
      status: "ACTIVE",
      notes,
    },
    include: {
      device: {
        select: {
          id: true,
          name: true,
          manufacturer: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

// Unassign device from facility
export async function unassignDeviceFromFacility(assignmentId: string, facilityId: string) {
  const assignment = await prisma.deviceAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment || assignment.facilityId !== facilityId) {
    throw new Error("Assignment not found or access denied");
  }

  return prisma.deviceAssignment.delete({
    where: { id: assignmentId },
  });
}

