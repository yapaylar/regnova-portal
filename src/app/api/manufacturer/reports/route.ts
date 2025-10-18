import { NextResponse } from "next/server";

import { requireManufacturerUser } from "@/lib/auth/guards";
import { createErrorResponse, toHttpError } from "@/lib/http/errors";
import { fetchManufacturerReports } from "@/lib/manufacturer/reports";
import { manufacturerReportQuerySchema } from "@/lib/manufacturer/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireManufacturerUser();
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = manufacturerReportQuerySchema.parse(params);

    const data = await fetchManufacturerReports(
      {
        manufacturerId: user.manufacturerId,
        search: query.search,
        status: query.status,
        reportType: query.reportType,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(data);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

