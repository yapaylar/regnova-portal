"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useRole } from "@/context/role-context";

export function FacilityRoleGate({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role !== "facility") {
      router.replace("/");
    }
  }, [role, router]);

  if (role !== "facility") {
    return null;
  }

  return <>{children}</>;
}

