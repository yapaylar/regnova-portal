"use client";

import { LogOut, Settings, User2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/context/auth-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRole } from "@/context/role-context";
import { cn } from "@/lib/utils";

const ROLE_LABELS = {
  admin: "Administrator",
  facility: "Facility",
  manufacturer: "Manufacturer",
} as const satisfies Record<string, string>;

const ROLE_HELP_TEXT: Record<"admin" | "facility" | "manufacturer", string> = {
  admin: "Full platform access",
  facility: "Facility workspace",
  manufacturer: "Manufacturer workspace",
};

type RoleSelectorProps = {
  user?: AuthUser | null;
  placement?: "header" | "sidebar";
};

export function RoleSelector({ user, placement = "header" }: RoleSelectorProps) {
  const { role, name, email, organization } = useRole();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const initials = useMemo(() => getInitials(name), [name]);
  const roleLabel = ROLE_LABELS[role];
  const helpText = ROLE_HELP_TEXT[role];
  const displayEmail = user?.email ?? email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "inline-flex h-12 items-center justify-between gap-3 px-3 py-2 text-left transition",
            "shadow-sm",
            placement === "header"
              ? "min-w-[14rem] rounded-xl border border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50 hover:bg-accent hover:text-accent-foreground"
              : "w-full rounded-lg border border-[var(--sidebar-border)] bg-background/80 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
          )}
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{name}</span>
            <span className="truncate text-xs text-muted-foreground">{organization}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto flex max-w-[45%] items-center justify-center truncate px-2 py-0.5 text-[10px] uppercase tracking-wide",
              placement === "sidebar"
                ? "border-[var(--sidebar-border)] text-[var(--sidebar-foreground)]/80"
                : "text-muted-foreground",
            )}
            title={roleLabel}
          >
            <span className="truncate">{roleLabel}</span>
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={placement === "sidebar" ? "center" : "end"} className="w-72">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">{displayEmail}</span>
          <span className="text-xs text-muted-foreground">{helpText}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className={menuItemClassName}>
            <User2 className="size-4" aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/settings" className={menuItemClassName}>
            <Settings className="size-4" aria-hidden />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={signingOut}
          onSelect={async () => {
            setSigningOut(true);
            try {
              await logout();
              toast.success("Signed out", {
                description: "You have been signed out.",
              });
              window.location.href = "/login";
            } catch (error) {
              console.error("Logout failed", error);
              toast.error("Logout failed", {
                description: "Please try again.",
              });
            } finally {
              setSigningOut(false);
            }
          }}
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const menuItemClassName = cn("flex w-full items-center gap-2");

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}
