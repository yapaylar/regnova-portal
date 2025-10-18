"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useRole } from "@/context/role-context";

export function ManufacturerRoleGate({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role !== "manufacturer") {
      router.replace("/");
    }
  }, [role, router]);

  if (role !== "manufacturer") {
    return null;
  }

  return <>{children}</>;
}
