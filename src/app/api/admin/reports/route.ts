import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchAdminReportList } from "@/lib/admin/data-access";
import { adminReportQuerySchema } from "@/lib/admin/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = adminReportQuerySchema.parse(params);

    const data = await fetchAdminReportList(
      {
        status: query.status,
        reportType: query.reportType,
        facilityId: query.facilityId,
        manufacturerId: query.manufacturerId,
        deviceId: query.deviceId,
        submittedAfter: query.submittedAfter,
        submittedBefore: query.submittedBefore,
        search: query.search,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(data);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}


