import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";

export async function GET(_: Request, { params }: { params: { trackingId: string } }) {
  try {
    const trackingId = params.trackingId.toUpperCase();

    const report = await prisma.report.findUnique({
      where: { trackingId },
      select: {
        id: true,
        trackingId: true,
        status: true,
        reportType: true,
        submittedAt: true,
        createdAt: true,
        details: true,
      },
    });

    if (!report) {
      throw new HttpError({ code: "REPORT_NOT_FOUND", message: "Report not found", status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

