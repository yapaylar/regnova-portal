import { Prisma, ReportStatus, ReportType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type FacilityReportFilters = {
  facilityId: string;
  search?: string;
  status?: ReportStatus;
  reportType?: ReportType;
};

type FacilityReportItem = {
  id: string;
  trackingId: string;
  reportType: ReportType;
  status: ReportStatus;
  summary: string | null;
  createdAt: string;
  submittedAt: string | null;
  occurredAt: string | null;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    manufacturer: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type FacilityReportResult = {
  items: FacilityReportItem[];
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

export async function fetchFacilityReports(filters: FacilityReportFilters, pagination: PaginationOptions = {}): Promise<FacilityReportResult> {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const where: Prisma.ReportWhereInput = {
    facilityId: filters.facilityId,
    submittedAt: { not: null },
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.reportType) {
    where.reportType = filters.reportType;
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

  const [total, reports] = await prisma.$transaction([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        trackingId: true,
        reportType: true,
        status: true,
        summary: true,
        createdAt: true,
        submittedAt: true,
        occurredAt: true,
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

  const items: FacilityReportItem[] = reports.map((report) => ({
    id: report.id,
    trackingId: report.trackingId,
    reportType: report.reportType,
    status: report.status,
    summary: report.summary,
    device: report.device
      ? {
          id: report.device.id,
          name: report.device.name,
          modelNumber: report.device.modelNumber,
          manufacturer: report.device.manufacturer,
        }
      : null,
    createdAt: report.createdAt.toISOString(),
    submittedAt: report.submittedAt?.toISOString() ?? null,
    occurredAt: report.occurredAt?.toISOString() ?? null,
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

