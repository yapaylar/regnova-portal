import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchAdminAuditLog } from "@/lib/admin/data-access";
import { adminAuditLogQuerySchema } from "@/lib/admin/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = adminAuditLogQuerySchema.parse(params);

    const data = await fetchAdminAuditLog(
      {
        event: query.event,
        reportId: query.reportId,
        userId: query.userId,
        createdAfter: query.createdAfter,
        createdBefore: query.createdBefore,
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


