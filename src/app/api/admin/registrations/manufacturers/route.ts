import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { fetchAdminManufacturerRegistrations } from "@/lib/admin/data-access";
import { toPaginatedResponse } from "@/lib/http/response";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const result = await fetchAdminManufacturerRegistrations(
      { status, search },
      { page, pageSize }
    );

    return NextResponse.json(toPaginatedResponse(result));
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

