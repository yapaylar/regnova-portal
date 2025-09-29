import { AppShell } from "@/components/layout/app-shell";
import { RoleProvider } from "@/context/role-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  );
}


