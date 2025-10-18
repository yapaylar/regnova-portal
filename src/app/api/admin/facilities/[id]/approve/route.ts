import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { approveFacilityRegistration } from "@/lib/admin/data-access";
import { z } from "zod";

export const runtime = "nodejs";

const approveSchema = z.object({
  facilityId: z.string().min(1).optional().nullable(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json().catch(() => ({}));
    const parsed = approveSchema.parse(body);

    await approveFacilityRegistration(params.id, parsed.facilityId ?? null, admin.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}
