export const dashboardKeys = {
  all: () => ["dashboard"] as const,
  metrics: () => [...dashboardKeys.all(), "metrics"] as const,
  complaints: () => [...dashboardKeys.all(), "complaints"] as const,
  recalls: () => [...dashboardKeys.all(), "recalls"] as const,
};

export const reportKeys = {
  draft: (draftId: string) => ["report", "draft", draftId] as const,
};

export const recallKeys = {
  all: () => ["recalls"] as const,
  list: () => [...recallKeys.all(), "list"] as const,
  detail: (recallId: string) => [...recallKeys.all(), "detail", recallId] as const,
};

export const resourceKeys = {
  all: () => ["resources"] as const,
  list: () => [...resourceKeys.all(), "list"] as const,
};

export const trackKeys = {
  detail: (trackingId: string) => ["track", trackingId] as const,
};

export const adminKeys = {
  reports: () => ["admin", "reports"] as const,
  users: () => ["admin", "users"] as const,
  devices: () => ["admin", "devices"] as const,
  pms: () => ["admin", "pms"] as const,
  auditLog: () => ["admin", "audit-log"] as const,
  metadata: () => ["admin", "metadata"] as const,
};

