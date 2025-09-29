const ROLE_PERMISSIONS: Record<"admin" | "facility" | "manufacturer", string[]> = {
  admin: [
    "report:create",
    "report:view:any",
    "report:manage",
    "device:manage",
    "audit:view",
    "user:manage",
  ],
  facility: [
    "report:create",
    "report:view:facility",
    "report:view:own",
    "device:view:facility",
    "pms:view",
  ],
  manufacturer: [
    "report:create",
    "report:view:own",
    "report:view:manufacturer",
    "device:view:manufacturer",
    "recall:view",
  ],
};

export function getPermissionsForRole(role: "admin" | "facility" | "manufacturer") {
  return ROLE_PERMISSIONS[role];
}

