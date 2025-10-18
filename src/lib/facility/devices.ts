import { Prisma, DeviceAssignmentStatus, RecallStatus } from "@prisma/client";

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
    deviceIds.length > 0
      ? prisma.recall.groupBy({
          by: ["deviceId"],
          where: {
            deviceId: { in: deviceIds },
            status: { in: [RecallStatus.ACTIVE, RecallStatus.DRAFT] },
          },
          _count: true,
        })
      : Promise.resolve([]),
  ]);

  const reportCountMap = new Map<string, number>();
  for (const group of reportGroups) {
    if (group.deviceId) {
      reportCountMap.set(group.deviceId, group._count);
    }
  }

  const recallCountMap = new Map<string, number>();
  for (const group of recallGroups) {
    if (group.deviceId) {
      recallCountMap.set(group.deviceId, group._count);
    }
  }

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

