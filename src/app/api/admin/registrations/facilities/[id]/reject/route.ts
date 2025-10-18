import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/guards";
import { rejectFacilityRegistration } from "@/lib/admin/data-access";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const { notes } = body;

    await rejectFacilityRegistration(params.id, admin.id, notes);

    return NextResponse.json({ success: true, message: "Registration rejected successfully" });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

