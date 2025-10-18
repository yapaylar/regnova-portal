import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { rejectFacilityRegistration } from "@/lib/admin/data-access";
import { z } from "zod";

export const runtime = "nodejs";

const rejectSchema = z.object({
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json().catch(() => ({}));
    const parsed = rejectSchema.parse(body);

    await rejectFacilityRegistration(params.id, admin.id, parsed.notes);

    return NextResponse.json({ success: true });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}
