"use client";

import { useMemo } from "react";

import { RoleContext, deriveRoleContextValue } from "@/context/role-context";
import { useAuth } from "@/context/auth-context";

type RoleProviderClientProps = {
  children: React.ReactNode;
};

export function RoleProviderClient({ children }: RoleProviderClientProps) {
  const { user, updateUser } = useAuth();
  const value = useMemo(() => deriveRoleContextValue(user ?? null, updateUser), [user, updateUser]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}


