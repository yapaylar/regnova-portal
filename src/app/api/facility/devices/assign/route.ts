import { NextResponse } from "next/server";
import { z } from "zod";

import { requireFacilityUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { assignDeviceToFacility } from "@/lib/facility/devices";

export const runtime = "nodejs";

const assignDeviceSchema = z.object({
  deviceId: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireFacilityUser();
    const body = await request.json();
    const { deviceId, notes } = assignDeviceSchema.parse(body);

    const assignment = await assignDeviceToFacility(user.facilityId, deviceId, notes);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}


