import { ProtectedRoute } from "@/components/layout/protected-route";
import { ManufacturerRoleGate } from "@/components/layout/manufacturer-role-gate";
import { RoleProviderClient } from "@/components/layout/role-provider-client";

export default function ManufacturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProviderClient>
      <ProtectedRoute>
        <ManufacturerRoleGate>{children}</ManufacturerRoleGate>
      </ProtectedRoute>
    </RoleProviderClient>
  );
}
