import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { adminManufacturerRegistrationQuerySchema } from "@/lib/admin/schemas";
import { fetchAdminManufacturerRegistrations } from "@/lib/admin/data-access";
import { toPaginatedResponse } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = adminManufacturerRegistrationQuerySchema.parse(params);

    const data = await fetchAdminManufacturerRegistrations(
      {
        status: query.status,
        search: query.search,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(toPaginatedResponse(data));
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}
