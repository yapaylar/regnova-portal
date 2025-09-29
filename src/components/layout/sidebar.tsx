"use client";

import { Book, Bell, ClipboardList, Cpu, FileWarning, Home, Search, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavItem } from "@/context/rbac";
import { cn } from "@/lib/utils";

const ICONS = {
  home: Home,
  "file-warning": FileWarning,
  bell: Bell,
  search: Search,
  book: Book,
  users: Users,
  cpu: Cpu,
  stethoscope: Stethoscope,
  "clipboard-list": ClipboardList,
};

type SidebarProps = {
  navigation: { main: NavItem[]; admin: NavItem[] };
  onNavigate?: () => void;
};

export function Sidebar({ navigation, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const renderNavGroup = (items: NavItem[], title?: string) => {
    if (items.length === 0) return null;

    return (
      <div>
        {title ? (
          <div className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
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
                  "flex items-center gap-3 rounded-md px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
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
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-4 pb-6">
          <div className="px-6 pt-4">
            <p className="text-xs uppercase text-muted-foreground">Main</p>
          </div>
          <div className="px-2">{renderNavGroup(navigation.main)}</div>
          {navigation.admin.length > 0 ? (
            <div className="px-2">
              {renderNavGroup(navigation.admin, "Admin")}
            </div>
          ) : null}
        </nav>
      </div>
    </div>
  );
}

