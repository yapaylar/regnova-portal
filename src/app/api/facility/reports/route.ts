import { NextResponse } from "next/server";
import { z } from "zod";

import { requireFacilityUser } from "@/lib/auth/guards";
import { toHttpError, createErrorResponse } from "@/lib/http/errors";
import { fetchFacilityReports, createFacilityReport } from "@/lib/facility/reports";
import { facilityReportQuerySchema } from "@/lib/facility/schemas";
import { toPaginatedResponse } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFacilityUser();
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = facilityReportQuerySchema.parse(params);

    const data = await fetchFacilityReports(
      {
        facilityId: user.facilityId!,
        search: query.search,
        status: query.status,
        reportType: query.reportType,
      },
      { page: query.page, pageSize: query.pageSize },
    );

    return NextResponse.json(toPaginatedResponse(data));
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

const createReportSchema = z.object({
  deviceId: z.string().min(1, "Device is required"),
  reportType: z.enum(["COMPLAINT", "ADVERSE_EVENT"]),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dateOccurred: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireFacilityUser();
    const body = await request.json();
    const reportData = createReportSchema.parse(body);

    const report = await createFacilityReport(user.facilityId, reportData);

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

