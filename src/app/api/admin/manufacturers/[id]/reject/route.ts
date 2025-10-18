import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { rejectManufacturerRegistration } from "@/lib/admin/data-access";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminUser();

    await rejectManufacturerRegistration(params.id, admin.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}
