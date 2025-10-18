"use client";

import { createContext, useContext, useMemo } from "react";

import { useAuth } from "@/context/auth-context";

export type Role = "admin" | "facility" | "manufacturer";

type RoleContextValue = {
  role: Role;
  name: string;
  email: string;
  organization: string;
  setRole: (role: Role) => void;
};

export const RoleContext = createContext<RoleContextValue | null>(null);

type RoleProviderProps = {
  children: React.ReactNode;
};

export function RoleProvider({ children }: RoleProviderProps) {
  const { user, updateUser } = useAuth();

  const value = useMemo(() => {
    const role = user?.profileType ?? "admin";
    const name = user && (user.firstName || user.lastName)
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.email ?? "Regnova User";
    return {
      role,
      name,
      email: user?.email ?? "launch@regnova.com",
      organization: user?.organization ?? "Regnova",
      setRole: (nextRole: Role) => {
        updateUser({ profileType: nextRole });
      },
    };
  }, [user, updateUser]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return context;
}

export function deriveRoleContextValue(user: any, updateUser: (data: any) => void): RoleContextValue {
  const role = user?.profileType ?? "admin";
  const name = user && (user.firstName || user.lastName)
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : user?.email ?? "Regnova User";
  return {
    role,
    name,
    email: user?.email ?? "launch@regnova.com",
    organization: user?.organization ?? "Regnova",
    setRole: (nextRole: Role) => {
      updateUser({ profileType: nextRole });
    },
  };
}
