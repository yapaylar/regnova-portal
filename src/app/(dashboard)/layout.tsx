import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { RoleProvider } from "@/context/role-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleProvider>
        <AppShell>{children}</AppShell>
      </RoleProvider>
    </ProtectedRoute>
  );
}


