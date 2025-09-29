"use client";

import Image from "next/image";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useRole } from "@/context/role-context";
import { getVisibleNav } from "@/context/rbac";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { GlobalSearch } from "./global-search";
import { Sidebar } from "./sidebar";
import { ThemeSwitcher } from "./theme-switcher";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { role } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigation = useMemo(() => getVisibleNav(role), [role]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-[var(--border-strong)] bg-[var(--header-background)] backdrop-blur supports-[backdrop-filter]:bg-[var(--header-background-blur)]">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs bg-[var(--sidebar)] p-0">
                <SheetHeader className="border-b border-[var(--sidebar-border)] px-4 py-3">
                  <SheetTitle className="text-sm font-semibold text-[var(--sidebar-foreground)]">Menu</SheetTitle>
                </SheetHeader>
                <Sidebar navigation={navigation} onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Regnova"
              width={150}
              height={48}
              priority
              className="h-11 w-auto"
            />
            <span className="hidden text-sm italic tracking-wide text-muted-foreground md:inline-block">
              Post Market Surveillance Center
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden w-full max-w-xs md:flex">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label="Open global search"
                className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                placeholder="Search…"
                readOnly
                onClick={() => setSearchOpen(true)}
              />
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 gap-6 px-4 pb-6 pt-4 md:px-6">
          <aside className="hidden w-64 shrink-0 md:flex md:flex-col">
            <Sidebar navigation={navigation} />
          </aside>

          <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-4 shadow-sm md:p-6">
              {children}
            </div>
            <footer className="mt-6 text-sm text-muted-foreground">
              © 2025 Regnova. Post-Market Surveillance • Inventory • Compliance.
            </footer>
          </main>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

