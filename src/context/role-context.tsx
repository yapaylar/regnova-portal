"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "facility" | "manufacturer";

type RoleContextValue = {
  role: Role;
  profile: RoleProfile;
  setRole: (role: Role) => void;
  updateProfile: (profile: Partial<RoleProfile>) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const ROLE_STORAGE_KEY = "regnova-role";
const PROFILE_STORAGE_KEY = "regnova-profile";

export type RoleProfile = {
  role: Role;
  name: string;
  email: string;
  organization: string;
};

const PROFILE_PRESETS: Record<Role, RoleProfile> = {
  admin: {
    role: "admin",
    name: "Laura Wright",
    email: "laura.wright@regnova.com",
    organization: "Regnova HQ",
  },
  facility: {
    role: "facility",
    name: "David Kim",
    email: "david.kim@centralvalley.org",
    organization: "Central Valley Hospital",
  },
  manufacturer: {
    role: "manufacturer",
    name: "Ethan Martinez",
    email: "ethan.martinez@regnova.com",
    organization: "Regnova Manufacturing",
  },
};

type RoleProviderProps = {
  children: React.ReactNode;
};

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRoleState] = useState<Role>("admin");
  const [profile, setProfileState] = useState<RoleProfile>(PROFILE_PRESETS.admin);

  const persist = (nextRole: Role, nextProfile: RoleProfile) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    }
  };

  useEffect(() => {
    const storedRole =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(ROLE_STORAGE_KEY) as Role | null)
        : null;
    const storedProfile =
      typeof window !== "undefined"
        ? window.localStorage.getItem(PROFILE_STORAGE_KEY)
        : null;

    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as RoleProfile;
        const fallback = PROFILE_PRESETS[parsed.role] ?? PROFILE_PRESETS.admin;
        setRoleState(parsed.role);
        const hydratedProfile = { ...fallback, ...parsed, role: parsed.role };
        setProfileState(hydratedProfile);
        persist(parsed.role, hydratedProfile);
        return;
      } catch (error) {
        console.error("Failed to parse stored profile", error);
      }
    }

    if (storedRole && PROFILE_PRESETS[storedRole]) {
      setRoleState(storedRole);
      const preset = PROFILE_PRESETS[storedRole];
      setProfileState(preset);
      persist(storedRole, preset);
    } else {
      persist("admin", PROFILE_PRESETS.admin);
    }
  }, []);

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    const preset = PROFILE_PRESETS[nextRole] ?? PROFILE_PRESETS.admin;
    setProfileState(preset);
    persist(nextRole, preset);
  };

  const updateProfile = (patch: Partial<RoleProfile>) => {
    setProfileState((current) => {
      const next = { ...current, ...patch, role: current.role };
      persist(next.role, next);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      role,
      profile,
      setRole,
      updateProfile,
    }),
    [role, profile],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return context;
}

