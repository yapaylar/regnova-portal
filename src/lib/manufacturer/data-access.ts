import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ManufacturerProductCreateInput } from "@/lib/manufacturer/schemas";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type ManufacturerProductFilters = {
  manufacturerId: string;
  search?: string;
};

export type ManufacturerProductListItem = {
  id: string;
  name: string;
  modelNumber: string | null;
  udi: string | null;
  deviceClass: string;
  registrationStatus: string;
  reportsCount: number;
  expectedComplaints: number;
  createdAt: string;
  updatedAt: string;
};

function normalizePagination({ page, pageSize }: PaginationOptions) {
  const normalizedPageSize = Math.min(Math.max(Number(pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const normalizedPage = Math.max(Number(page ?? 1) || 1, 1);
  const skip = (normalizedPage - 1) * normalizedPageSize;

  return { page: normalizedPage, pageSize: normalizedPageSize, skip };
}

function buildPaginationResult<T>(items: T[], total: number, page: number, pageSize: number) {
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

export async function fetchManufacturerProductList(filters: ManufacturerProductFilters, pagination: PaginationOptions = {}) {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.DeviceWhereInput = {
    manufacturerId: filters.manufacturerId,
  };

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

  const select = {
    id: true,
    name: true,
    modelNumber: true,
    udi: true,
    deviceClass: true,
    registrationStatus: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        reports: true,
      },
    },
  } satisfies Prisma.DeviceSelect;

  const [total, devices] = await prisma.$transaction([
    prisma.device.count({ where }),
    prisma.device.findMany({
      where,
      select,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  const items: ManufacturerProductListItem[] = devices.map((device) => ({
    id: device.id,
    name: device.name,
    modelNumber: device.modelNumber,
    udi: device.udi,
    deviceClass: device.deviceClass,
    registrationStatus: device.registrationStatus,
    reportsCount: device._count?.reports ?? 0,
    expectedComplaints: Math.max(device._count?.reports ?? 0, 1),
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  }));

  return buildPaginationResult(items, total, page, pageSize);
}

export async function createManufacturerProduct(manufacturerId: string, input: ManufacturerProductCreateInput) {
  const device = await prisma.device.create({
    data: {
      manufacturerId,
      name: input.name,
      modelNumber: input.modelNumber ?? null,
      udi: input.udi ?? null,
      deviceClass: input.deviceClass,
      registrationStatus: input.registrationStatus,
    },
  });

  return {
    id: device.id,
    name: device.name,
    modelNumber: device.modelNumber,
    udi: device.udi,
    deviceClass: device.deviceClass,
    registrationStatus: device.registrationStatus,
    reportsCount: 0,
    expectedComplaints: 1,
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  } satisfies ManufacturerProductListItem;
}

