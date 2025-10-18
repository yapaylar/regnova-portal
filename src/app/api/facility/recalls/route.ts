import { NextResponse } from "next/server";

import { requireFacilityUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchFacilityRecalls } from "@/lib/facility/recalls";
import { facilityRecallQuerySchema } from "@/lib/facility/schemas";
import { toPaginatedResponse } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFacilityUser();
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = facilityRecallQuerySchema.parse(params);

    const data = await fetchFacilityRecalls(
      {
        facilityId: user.facilityId!,
        search: query.search,
        status: query.status,
        actionType: query.actionType,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(toPaginatedResponse(data));
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

