import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation";
import { generateUniqueTrackingId, buildInitialHistory } from "@/lib/report";
import { getSessionUser } from "@/lib/auth/session";
import { createErrorResponse, toHttpError } from "@/lib/http/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reportSchema.parse(body);

    const sessionUser = await getSessionUser();

    const trackingId = await generateUniqueTrackingId(prisma);

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.report.create({
        data: {
          trackingId,
          reportType: parsed.reportType === "adverse-event" ? "ADVERSE_EVENT" : "COMPLAINT",
          status: "SUBMITTED",
          submittedById: sessionUser?.id ?? null,
          facilityId: null,
          manufacturerId: null,
          deviceId: null,
          occurredAt: parsed.event.date ? new Date(parsed.event.date) : null,
          summary: parsed.event.description.slice(0, 255),
          details: parsed,
          attachments: parsed.attachments,
          submittedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          user: sessionUser
            ? {
                connect: { id: sessionUser.id },
              }
            : undefined,
          report: {
            connect: { id: created.id },
          },
          event: "REPORT_CREATED",
          message: `Report ${created.trackingId} submitted`,
          metadata: {
            reportType: created.reportType,
            severity: parsed.event.severity,
          },
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        reportId: report.id,
        trackingId: report.trackingId,
        status: report.status,
        history: buildInitialHistory(report),
      },
      { status: 201 },
    );
  } catch (error) {
    const httpError = toHttpError(error);
    return NextResponse.json(createErrorResponse(httpError), { status: httpError.status });
  }
}

