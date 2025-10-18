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
  { title: "Reports", href: "/admin/reports", icon: "file-text" },
  { title: "Devices", href: "/admin/devices", icon: "stethoscope" },
  { title: "PMS", href: "/admin/pms", icon: "cpu" },
  { title: "Audit Log", href: "/admin/audit", icon: "clipboard-list" },
];

export const ADMIN_APPROVAL_NAV: NavItem[] = [
  { title: "Manufacturer Approvals", href: "/admin/approvals/manufacturers", icon: "shield-check" },
  { title: "Facility Approvals", href: "/admin/approvals/facilities", icon: "shield-check" },
];

export const MANUFACTURER_NAV: NavItem[] = [
  { title: "Products", href: "/manufacturer/products", icon: "package" },
  { title: "Complaints", href: "/manufacturer/complaints", icon: "message-square" },
  { title: "Recalls", href: "/manufacturer/recalls", icon: "alert-triangle" },
  { title: "Documents", href: "/manufacturer/documents", icon: "folder" },
  { title: "Analytics", href: "/manufacturer/analytics", icon: "chart-bar" },
];

export const FACILITY_NAV: NavItem[] = [
  { title: "My Devices", href: "/facility/devices", icon: "stethoscope" },
  { title: "Complaints & Report Issue", href: "/facility/complaints", icon: "message-square" },
  { title: "Recalls", href: "/facility/recalls", icon: "alert-triangle" },
  { title: "Resources", href: "/facility/resources", icon: "book" },
];

export function getVisibleNav(role: Role) {
  const main = role === "admin" ? [] : MAIN_NAV.filter((item) => {
    if (role === "manufacturer") {
      return item.href === "/";
    }
    if (role === "facility") {
      return item.href === "/" || item.href === "/track";
    }
    return true;
  });

  const admin = role === "admin" ? ADMIN_NAV : [];
  const approvals = role === "admin" ? ADMIN_APPROVAL_NAV : [];
  const manufacturer = role === "manufacturer" ? MANUFACTURER_NAV : [];
  const facility = role === "facility" ? FACILITY_NAV : [];

  return { main, admin, approvals, manufacturer, facility };
}
