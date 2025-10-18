import { Prisma, RecallActionType, RecallStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type ManufacturerRecallFilters = {
  manufacturerId: string;
  search?: string;
  status?: RecallStatus;
  actionType?: RecallActionType;
  region?: string;
};

export type ManufacturerRecallItem = {
  id: string;
  title: string;
  reference: string;
  status: RecallStatus;
  actionType: RecallActionType;
  region: string;
  description: string;
  createdAt: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
  } | null;
  fsnLinks: Array<{ label: string; url: string }>;
  affectedLots: string[];
  correctiveActions: string[];
};

export type ManufacturerRecallResult = {
  items: ManufacturerRecallItem[];
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

export async function fetchManufacturerRecalls(
  filters: ManufacturerRecallFilters,
  pagination: PaginationOptions = {},
): Promise<ManufacturerRecallResult> {
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
  const where: Prisma.RecallWhereInput = {
    manufacturerId: filters.manufacturerId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.actionType) {
    where.actionType = filters.actionType;
  }

  if (filters.region && filters.region.trim().length > 0) {
    where.region = filters.region;
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { reference: { contains: searchTerm, mode: "insensitive" } },
        {
          device: {
            name: { contains: searchTerm, mode: "insensitive" },
          },
        },
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
        createdAt: true,
        effectiveStart: true,
        effectiveEnd: true,
        metadata: true,
        device: {
          select: {
            id: true,
            name: true,
            modelNumber: true,
          },
        },
      },
    }),
  ]);

  const items: ManufacturerRecallItem[] = recalls.map((recall) => {
    const metadata = (recall.metadata as Record<string, unknown>) ?? {};
    const fsnLinks = Array.isArray(metadata.fsnLinks)
      ? metadata.fsnLinks
          .map((entry) =>
            typeof entry === "object" && entry !== null && "label" in entry && "url" in entry
              ? { label: String((entry as { label: unknown }).label), url: String((entry as { url: unknown }).url) }
              : null,
          )
          .filter((link): link is { label: string; url: string } => Boolean(link))
      : [];

    const affectedLots = Array.isArray(metadata.affectedLots)
      ? metadata.affectedLots.map((lot) => String(lot))
      : [];

    const correctiveActions = Array.isArray(metadata.correctiveActions)
      ? metadata.correctiveActions.map((action) => String(action))
      : [];

    return {
      id: recall.id,
      title: recall.title,
      reference: recall.reference,
      status: recall.status,
      actionType: recall.actionType,
      region: recall.region,
      description: recall.description,
      createdAt: recall.createdAt.toISOString(),
      effectiveStart: recall.effectiveStart?.toISOString() ?? null,
      effectiveEnd: recall.effectiveEnd?.toISOString() ?? null,
      device: recall.device,
      fsnLinks,
      affectedLots,
      correctiveActions,
    };
  });

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

