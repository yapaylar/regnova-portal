"use client";

import Link from "next/link";

import { useAuth } from "@/context/auth-context";
import { useRole } from "@/context/role-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { role, organization } = useRole();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session expired</CardTitle>
          <CardDescription>Please sign in again to view your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm text-primary underline">
            Go to login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Profile summary</CardTitle>
            <CardDescription>Overview of your account and workspace role.</CardDescription>
          </div>
          <Badge variant="secondary" className="uppercase">
            {role}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <ProfileField label="Full name" value={[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"} />
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Organization" value={organization || user.organization || "—"} />
          <ProfileField label="Permissions" value={user.permissions.length ? user.permissions.join(", ") : "No permissions assigned"} />
          <ProfileField label="Facility" value={user.facilityId ?? "—"} />
          <ProfileField label="Manufacturer" value={user.manufacturerId ?? "—"} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manage your account</CardTitle>
          <CardDescription>Update personal and security settings from the account settings page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/account/settings" className="text-sm text-primary underline">
            Go to account settings
          </Link>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Need changes to workspace roles or permissions? Contact your administrator for elevated access requests.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}
