"use client";

import { LogOut, Settings, User2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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
import { useRole } from "@/context/role-context";
import type { AuthUser } from "@/context/auth-context";
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
};

export function RoleSelector({ user }: RoleSelectorProps) {
  const { role, setRole, name, email, organization } = useRole();

  const initials = useMemo(() => getInitials(name), [name]);
  const roleLabel = ROLE_LABELS[role];
  const helpText = ROLE_HELP_TEXT[role];
  const displayEmail = user?.email ?? email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="inline-flex h-12 min-w-[14rem] items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-left shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50 hover:bg-accent hover:text-accent-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{organization}</span>
            </div>
          </div>
          <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {roleLabel}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
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
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={handleSignOut}>
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

function handleSignOut(event: Event) {
  event.preventDefault();
  console.info("Sign out requested");
}
