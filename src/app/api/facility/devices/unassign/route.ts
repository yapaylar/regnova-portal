import { NextResponse } from "next/server";
import { z } from "zod";

import { requireFacilityUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { unassignDeviceFromFacility } from "@/lib/facility/devices";

export const runtime = "nodejs";

const unassignDeviceSchema = z.object({
  assignmentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireFacilityUser();
    const body = await request.json();
    const { assignmentId } = unassignDeviceSchema.parse(body);

    await unassignDeviceFromFacility(assignmentId, user.facilityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

