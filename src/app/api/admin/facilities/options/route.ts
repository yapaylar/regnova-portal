import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchFacilityOptions } from "@/lib/admin/data-access";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;

    const facilities = await fetchFacilityOptions(search);

    return NextResponse.json(facilities);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}
