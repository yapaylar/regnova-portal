import { NextResponse } from "next/server";

import { requireFacilityUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchFacilityResources } from "@/lib/facility/resources";
import { facilityResourceQuerySchema } from "@/lib/facility/schemas";
import { toPaginatedResponse } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFacilityUser();
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = facilityResourceQuerySchema.parse(params);

    const data = await fetchFacilityResources(
      {
        facilityId: user.facilityId!,
        search: query.search,
        type: query.type,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(toPaginatedResponse(data));
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

