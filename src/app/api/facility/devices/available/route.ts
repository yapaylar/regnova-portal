import { NextResponse } from "next/server";

import { requireFacilityUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchAvailableDevices } from "@/lib/facility/devices";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFacilityUser();
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;

    const devices = await fetchAvailableDevices(user.facilityId, search);

    return NextResponse.json({ devices });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}


