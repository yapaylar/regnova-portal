import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type PaginationOptions = {
  page?: number | null;
  pageSize?: number | null;
};

type ManufacturerDocumentFilters = {
  manufacturerId: string;
  search?: string;
  deviceId?: string;
};

export type ManufacturerDocumentFolder = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManufacturerDocumentFile = {
  id: string;
  folderId: string;
  deviceId: string | null;
  title: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  version: string | null;
  uploadedBy: string | null;
  uploadedAt: string;
  metadata: Prisma.JsonValue | null;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
  } | null;
  folder: {
    id: string;
    name: string;
  };
};

export type ManufacturerDocumentResult = {
  folders: ManufacturerDocumentFolder[];
  files: ManufacturerDocumentFile[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

function normalizePagination({ page, pageSize }: PaginationOptions = {}) {
  const DEFAULT_PAGE_SIZE = 20;
  const MAX_PAGE_SIZE = 50;

  const normalizedPageSize = Math.min(Math.max(Number(pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const normalizedPage = Math.max(Number(page ?? 1) || 1, 1);
  const skip = (normalizedPage - 1) * normalizedPageSize;

  return { page: normalizedPage, pageSize: normalizedPageSize, skip };
}

export async function fetchManufacturerDocuments(
  filters: ManufacturerDocumentFilters,
  pagination: PaginationOptions = {},
): Promise<ManufacturerDocumentResult> {
  const { page, pageSize, skip } = normalizePagination(pagination);

  const fileWhere: Prisma.DocumentFileWhereInput = {
    folder: {
      manufacturerId: filters.manufacturerId,
    },
  };

  if (filters.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      fileWhere.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { filename: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  if (filters.deviceId) {
    fileWhere.deviceId = filters.deviceId;
  }

  const [folders, total, files] = await prisma.$transaction([
    prisma.documentFolder.findMany({
      where: { manufacturerId: filters.manufacturerId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.documentFile.count({ where: fileWhere }),
    prisma.documentFile.findMany({
      where: fileWhere,
      orderBy: [{ uploadedAt: "desc" }],
      skip,
      take: pageSize,
      include: {
        device: {
          select: {
            id: true,
            name: true,
            modelNumber: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const folderResults: ManufacturerDocumentFolder[] = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    description: folder.description,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  }));

  const fileResults: ManufacturerDocumentFile[] = files.map((file) => ({
    id: file.id,
    folderId: file.folderId,
    deviceId: file.deviceId,
    title: file.title,
    filename: file.filename,
    url: file.url,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    version: file.version,
    uploadedBy: file.uploadedBy,
    uploadedAt: file.uploadedAt.toISOString(),
    metadata: file.metadata,
    device: file.device,
    folder: file.folder,
  }));

  const consumed = (page - 1) * pageSize + fileResults.length;
  const hasNextPage = consumed < total;

  return {
    folders: folderResults,
    files: fileResults,
    total,
    page,
    pageSize,
    hasNextPage,
  };
}

export async function createManufacturerDocumentFolder(input: {
  manufacturerId: string;
  name: string;
  description?: string | null;
}) {
  const folder = await prisma.documentFolder.create({
    data: {
      manufacturerId: input.manufacturerId,
      name: input.name,
      description: input.description ?? null,
    },
  });

  return {
    id: folder.id,
    name: folder.name,
    description: folder.description,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  } satisfies ManufacturerDocumentFolder;
}

export async function createManufacturerDocumentFile(input: {
  folderId: string;
  title: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  version?: string | null;
  uploadedBy?: string | null;
  deviceId?: string | null;
  metadata?: Prisma.JsonValue;
}) {
  const file = await prisma.documentFile.create({
    data: {
      folderId: input.folderId,
      title: input.title,
      filename: input.filename,
      url: input.url,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      version: input.version ?? null,
      uploadedBy: input.uploadedBy ?? null,
      deviceId: input.deviceId ?? null,
      metadata: input.metadata ?? undefined,
    },
    include: {
      device: {
        select: {
          id: true,
          name: true,
          modelNumber: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    id: file.id,
    folderId: file.folderId,
    deviceId: file.deviceId,
    title: file.title,
    filename: file.filename,
    url: file.url,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    version: file.version,
    uploadedBy: file.uploadedBy,
    uploadedAt: file.uploadedAt.toISOString(),
    metadata: file.metadata,
    device: file.device,
    folder: file.folder,
  } satisfies ManufacturerDocumentFile;
}

