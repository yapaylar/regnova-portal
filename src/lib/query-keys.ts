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
  manufacturerRegistrations: () => ["admin", "manufacturer-registrations"] as const,
  facilityRegistrations: () => ["admin", "facility-registrations"] as const,
  manufacturerOptions: () => ["admin", "manufacturer-options"] as const,
  facilityOptions: () => ["admin", "facility-options"] as const,
};

export const manufacturerKeys = {
  all: () => ["manufacturer"] as const,
  products: (filters?: Record<string, unknown>) => [...manufacturerKeys.all(), "products", filters] as const,
  reports: (filters?: Record<string, unknown>) => [...manufacturerKeys.all(), "reports", filters] as const,
  recalls: (filters?: Record<string, unknown>) => [...manufacturerKeys.all(), "recalls", filters] as const,
  documents: (folderId?: string) => [...manufacturerKeys.all(), "documents", folderId] as const,
  analytics: () => [...manufacturerKeys.all(), "analytics"] as const,
};

export const facilityKeys = {
  all: () => ["facility"] as const,
  devices: (filters?: Record<string, unknown>) => [...facilityKeys.all(), "devices", filters] as const,
  reports: (filters?: Record<string, unknown>) => [...facilityKeys.all(), "reports", filters] as const,
  recalls: (filters?: Record<string, unknown>) => [...facilityKeys.all(), "recalls", filters] as const,
  resources: (filters?: Record<string, unknown>) => [...facilityKeys.all(), "resources", filters] as const,
};

