import { Prisma, RecallActionType, RecallStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type FacilityRecallFilters = {
  facilityId: string;
  search?: string;
  status?: RecallStatus;
  actionType?: RecallActionType;
};

type FacilityRecallItem = {
  id: string;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    manufacturer: {
      id: string;
      name: string;
    };
  } | null;
  title: string;
  reference: string;
  status: RecallStatus;
  actionType: RecallActionType;
  region: string;
  description: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  createdAt: string;
};

type FacilityRecallResult = {
  items: FacilityRecallItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

function normalizePagination({ page, pageSize }: PaginationOptions = {}) {
  const normalizedPageSize = Math.min(Math.max(Number(pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const normalizedPage = Math.max(Number(page ?? 1) || 1, 1);
  const skip = (normalizedPage - 1) * normalizedPageSize;

  return { page: normalizedPage, pageSize: normalizedPageSize, skip };
}

export async function fetchFacilityRecalls(filters: FacilityRecallFilters, pagination: PaginationOptions = {}): Promise<FacilityRecallResult> {
  const { page, pageSize, skip } = normalizePagination(pagination);

  // TODO: Implement Recall model in schema
  // Returning empty result for now
  return {
    items: [],
    total: 0,
    page,
    pageSize,
    hasNextPage: false,
  };

  /* Commented out until Recall model is added
  const assignmentDeviceIds = await prisma.deviceAssignment.findMany({
    where: {
      facilityId: filters.facilityId,
    },
    select: { deviceId: true },
  });

  const deviceIds = assignmentDeviceIds.map((d) => d.deviceId).filter(Boolean) as string[];

  if (deviceIds.length === 0) {
    return { items: [], total: 0, page, pageSize, hasNextPage: false };
  }

  const where: Prisma.RecallWhereInput = {
    deviceId: { in: deviceIds },
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.actionType) {
    where.actionType = filters.actionType;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { reference: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  const [total, recalls] = await prisma.$transaction([
    prisma.recall.count({ where }),
    prisma.recall.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        reference: true,
        status: true,
        actionType: true,
        region: true,
        description: true,
        effectiveStart: true,
        effectiveEnd: true,
        createdAt: true,
        device: {
          select: {
            id: true,
            name: true,
            modelNumber: true,
            manufacturer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const items: FacilityRecallItem[] = recalls.map((recall) => ({
    id: recall.id,
    title: recall.title,
    reference: recall.reference,
    status: recall.status,
    actionType: recall.actionType,
    region: recall.region,
    description: recall.description,
    effectiveStart: recall.effectiveStart?.toISOString() ?? null,
    effectiveEnd: recall.effectiveEnd?.toISOString() ?? null,
    createdAt: recall.createdAt.toISOString(),
    device: recall.device
      ? {
          id: recall.device.id,
          name: recall.device.name,
          modelNumber: recall.device.modelNumber,
          manufacturer: recall.device.manufacturer,
        }
      : null,
  }));

  const consumed = (page - 1) * pageSize + items.length;
  const hasNextPage = consumed < total;

  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage,
  };
  */
}

