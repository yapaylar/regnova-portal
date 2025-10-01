import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchAdminPmsVisits, createAdminPmsVisit } from "@/lib/admin/data-access";
import { adminPmsQuerySchema, adminPmsCreateSchema } from "@/lib/admin/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = adminPmsQuerySchema.parse(params);

    const data = await fetchAdminPmsVisits(
      {
        facilityId: query.facilityId,
        visitAfter: query.visitAfter,
        visitBefore: query.visitBefore,
        search: query.search,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(data);
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdminUser();
    const body = await request.json();
    const payload = adminPmsCreateSchema.parse(body);

    const { visit } = await createAdminPmsVisit(
      {
        facilityId: payload.facilityId ?? null,
        organization: payload.organization,
        visitDate: payload.visitDate,
        notes: payload.notes,
        attachments: payload.attachments ?? [],
      },
      adminUser.id,
    );

    return NextResponse.json({
      visit,
    }, { status: 201 });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}


