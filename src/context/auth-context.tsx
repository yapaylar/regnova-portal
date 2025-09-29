"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type UserProfileType = "admin" | "facility" | "manufacturer";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organization: string | null;
  profileType: UserProfileType;
  facilityId: string | null;
  manufacturerId: string | null;
  permissions: string[];
};

type AuthSession = {
  user: AuthUser;
  refreshToken?: string | null;
};

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  clearSession: () => void;
  logout: (fingerprint?: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "regnova-auth-session";

function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function loadStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed;
  } catch (error) {
    console.error("Failed to parse stored auth session", error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setSessionState(stored);
    }
    setIsBootstrapping(false);
  }, []);

  const setSession = useCallback((nextSession: AuthSession) => {
    setSessionState(nextSession);
    persistSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    persistSession(null);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<AuthUser>) => {
      setSessionState((current) => {
        if (!current) return current;
        const updated: AuthSession = {
          ...current,
          user: {
            ...current.user,
            ...patch,
          },
        };
        persistSession(updated);
        return updated;
      });
    },
    [],
  );

  const logout = useCallback(
    async (fingerprint?: string | null) => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: session?.refreshToken ?? "",
            fingerprint: fingerprint ?? undefined,
          }),
        });
      } catch (error) {
        console.error("Logout request failed", error);
      } finally {
        clearSession();
      }
    },
    [session, clearSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      refreshToken: session?.refreshToken ?? null,
      isAuthenticated: Boolean(session?.user),
      isBootstrapping,
      setSession,
      updateUser,
      clearSession,
      logout,
    }),
    [session, isBootstrapping, setSession, updateUser, clearSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


