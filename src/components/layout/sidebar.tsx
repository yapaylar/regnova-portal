"use client";

import {
  AlertTriangle,
  Book,
  Bell,
  ChartBar,
  ClipboardList,
  Cpu,
  FileText,
  FileWarning,
  Folder,
  Home,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavItem } from "@/context/rbac";
import { cn } from "@/lib/utils";
import { RoleSelector } from "@/components/layout/role-selector";

const ICONS = {
  home: Home,
  "file-warning": FileWarning,
  "file-text": FileText,
  bell: Bell,
  search: Search,
  book: Book,
  users: Users,
  cpu: Cpu,
  stethoscope: Stethoscope,
  "clipboard-list": ClipboardList,
  "shield-check": ShieldCheck,
  package: Package,
  "message-square": MessageSquare,
  "alert-triangle": AlertTriangle,
  folder: Folder,
  "chart-bar": ChartBar,
};

type SidebarProps = {
  navigation: {
    main: NavItem[];
    admin: NavItem[];
    approvals?: NavItem[];
    manufacturer?: NavItem[];
    facility?: NavItem[];
  };
  onNavigate?: () => void;
};

export function Sidebar({ navigation, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const renderNavGroup = (items: NavItem[], title?: string) => {
    if (items.length === 0) return null;

    return (
      <div>
        {title ? (
          <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-foreground)]/70">
            {title}
          </div>
        ) : null}
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = ICONS[item.icon ?? ""];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
                    : "text-[var(--sidebar-foreground)]/80 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
                )}
              >
                {Icon ? <Icon className="size-4" aria-hidden /> : null}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col text-[var(--sidebar-foreground)]">
      <div className="flex-1 overflow-y-auto px-2 pb-24 pt-6">
        <nav className="flex flex-col gap-6">
          {navigation.main.length > 0 ? (
            <div>
              <p className="px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-foreground)]/70">Main</p>
              <div className="mt-2 space-y-1">{renderNavGroup(navigation.main)}</div>
            </div>
          ) : null}
          {navigation.admin.length > 0 ? (
            <div>
              {renderNavGroup(navigation.admin, "Admin")}
            </div>
          ) : null}
          {navigation.approvals && navigation.approvals.length > 0 ? (
            <div>
              {renderNavGroup(navigation.approvals, "Approvals")}
            </div>
          ) : null}
          {navigation.manufacturer && navigation.manufacturer.length > 0 ? (
            <div>
              {renderNavGroup(navigation.manufacturer, "Manufacturer")}
            </div>
          ) : null}
          {navigation.facility && navigation.facility.length > 0 ? (
            <div>
              {renderNavGroup(navigation.facility, "Facility")}
            </div>
          ) : null}
        </nav>
      </div>

      <div className="sticky bottom-0 border-t border-[var(--sidebar-border)] bg-background/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <RoleSelector placement="sidebar" />
      </div>
    </div>
  );
}

