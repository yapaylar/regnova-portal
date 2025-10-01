"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

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
  refreshToken: string | null;
  rememberMe: boolean;
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
  refreshSession: () => Promise<boolean>;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit & { skipAuthRetry?: boolean }) => Promise<Response>;
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
    return {
      ...parsed,
      refreshToken: parsed.refreshToken ?? null,
      rememberMe: parsed.rememberMe ?? false,
    };
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
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

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

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) {
      clearSession();
      return false;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshPromise = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            refreshToken: session.refreshToken,
          }),
        });

        if (!response.ok) {
          clearSession();
          return false;
        }

        const data = await response.json();

        setSession({
          user: data.user,
          refreshToken: data.refreshToken ?? session.refreshToken,
          rememberMe: session.rememberMe,
        });

        return true;
      } catch (error) {
        console.error("Failed to refresh session", error);
        clearSession();
        return false;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [session, setSession, clearSession]);

  const fetchWithAuth = useCallback<
    AuthContextValue["fetchWithAuth"]
  >(
    async (input, init) => {
      const response = await fetch(input, {
        ...init,
        credentials: init?.credentials ?? "include",
      });

      if (response.status !== 401 || init?.skipAuthRetry === true) {
        return response;
      }

      const refreshed = await refreshSession();

      if (!refreshed) {
        return response;
      }

      return fetch(input, {
        ...init,
        credentials: init?.credentials ?? "include",
        skipAuthRetry: true,
      } as RequestInit & { skipAuthRetry?: boolean });
    },
    [refreshSession],
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
      refreshSession,
      fetchWithAuth,
    }),
    [session, isBootstrapping, setSession, updateUser, clearSession, logout, refreshSession, fetchWithAuth],
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


