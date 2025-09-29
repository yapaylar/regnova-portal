import type { PrismaClient, Report, ReportStatus } from "@prisma/client";

const TRACKING_PREFIX = "CMP";

function buildTrackingCandidate(date = new Date()) {
  const year = date.getUTCFullYear();
  const randomSegment = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return `${TRACKING_PREFIX}-${year}-${randomSegment}`;
}

export async function generateUniqueTrackingId(prisma: PrismaClient) {
  let attempt = 0;
  let candidate = buildTrackingCandidate();
  while (attempt < 5) {
    const existing = await prisma.report.findUnique({ where: { trackingId: candidate } });
    if (!existing) {
      return candidate;
    }
    candidate = buildTrackingCandidate();
    attempt += 1;
  }
  throw new Error("Could not generate unique tracking ID");
}

export type ReportHistoryItem = {
  status: ReportStatus;
  date: string;
  note: string;
};

export function buildInitialHistory(report: Report): ReportHistoryItem[] {
  const submittedAt = report.submittedAt ?? report.createdAt;
  return [
    {
      status: report.status,
      date: submittedAt.toISOString(),
      note: "Report submitted to Regnova",
    },
  ];
}
 