import { NextResponse } from "next/server";

import { requireManufacturerUser } from "@/lib/auth/guards";
import { createErrorResponse, toHttpError } from "@/lib/http/errors";
import { fetchManufacturerDocuments } from "@/lib/manufacturer/documents";
import { manufacturerDocumentQuerySchema } from "@/lib/manufacturer/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireManufacturerUser();
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = manufacturerDocumentQuerySchema.parse(params);

    const data = await fetchManufacturerDocuments(
      {
        manufacturerId: user.manufacturerId,
        search: query.search,
        deviceId: query.deviceId ?? undefined,
      },
      {
        page: query.page,
        pageSize: query.pageSize,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

