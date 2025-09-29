export const REPORT_STEPS = [
  "report-type",
  "device-information",
  "event-details",
  "facility-details",
  "reporter-details",
  "attachments",
  "review",
] as const;

export type ReportStep = (typeof REPORT_STEPS)[number];

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];


