import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type FacilityResourceFilters = {
  facilityId: string;
  search?: string;
  type?: string;
};

type FacilityResourceItem = {
  id: string;
  title: string;
  type: string;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    manufacturer: {
      id: string;
      name: string;
    };
  } | null;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  version: string | null;
};

type FacilityResourceResult = {
  items: FacilityResourceItem[];
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

export async function fetchFacilityResources(filters: FacilityResourceFilters, pagination: PaginationOptions = {}): Promise<FacilityResourceResult> {
  const { page, pageSize, skip } = normalizePagination(pagination);

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

  const where: Prisma.DocumentFileWhereInput = {
    OR: [{ deviceId: { in: deviceIds } }, { folder: { manufacturer: { devices: { some: { id: { in: deviceIds } } } } } }],
  };

  if (filters.type) {
    where.metadata = {
      path: ["type"],
      equals: filters.type,
    } as Prisma.JsonFilter;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { filename: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  const [total, files] = await prisma.$transaction([
    prisma.documentFile.count({ where }),
    prisma.documentFile.findMany({
      where,
      orderBy: [{ uploadedAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        filename: true,
        url: true,
        mimeType: true,
        sizeBytes: true,
        version: true,
        uploadedAt: true,
        metadata: true,
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

  const items: FacilityResourceItem[] = files.map((file) => ({
    id: file.id,
    title: file.title,
    type: (file.metadata as { type?: string } | null)?.type ?? "GENERAL",
    url: file.url,
    filename: file.filename,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    version: file.version ?? null,
    uploadedAt: file.uploadedAt.toISOString(),
    device: file.device
      ? {
          id: file.device.id,
          name: file.device.name,
          modelNumber: file.device.modelNumber,
          manufacturer: file.device.manufacturer,
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
}

