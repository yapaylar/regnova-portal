import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { fetchFacilityOptions } from "@/lib/admin/data-access";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";

export async function GET() {
  try {
    await requireAdminUser();
    const facilities = await fetchFacilityOptions();
    return NextResponse.json(facilities);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}
