import { Role } from "./role-context";

export type NavItem = {
  title: string;
  href: string;
  icon?: string;
};

export const MAIN_NAV: NavItem[] = [
  { title: "Home", href: "/", icon: "home" },
  { title: "Report Issue", href: "/report", icon: "file-warning" },
  { title: "Recalls & Alerts", href: "/recalls", icon: "bell" },
  { title: "Track Complaint", href: "/track", icon: "search" },
  { title: "Resources", href: "/resources", icon: "book" },
];

export const ADMIN_NAV: NavItem[] = [
  { title: "Users & Roles", href: "/admin/users", icon: "users" },
  { title: "Devices", href: "/admin/devices", icon: "stethoscope" },
  { title: "PMS", href: "/admin/pms", icon: "cpu" },
  { title: "Audit Log", href: "/admin/audit", icon: "clipboard-list" },
];

export function getVisibleNav(role: Role) {
  const main = MAIN_NAV;
  const admin = ADMIN_NAV.filter((item) => {
    if (role === "admin") return true;
    if (role === "facility") {
      return item.href === "/admin/devices" || item.href === "/admin/pms";
    }
    return false;
  });

  return { main, admin };
}

