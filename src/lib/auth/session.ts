import { cookies } from "next/headers";

import { verifyAccessToken } from "@/lib/auth/jwt";

const ACCESS_COOKIE_NAME = "regnova.access";
const REFRESH_COOKIE_NAME = "regnova.refresh";
const FINGERPRINT_COOKIE_NAME = "regnova.fp";

export const ACCESS_COOKIE_MAX_AGE = 60 * 15; // 15 minutes
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setAccessCookie(token: string, maxAge = ACCESS_COOKIE_MAX_AGE) {
  cookies().set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function setRefreshCookie(token: string, maxAge = REFRESH_COOKIE_MAX_AGE) {
  cookies().set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function clearSessionCookies() {
  cookies().set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookies().set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookies().set(FINGERPRINT_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getRefreshCookie() {
  return cookies().get(REFRESH_COOKIE_NAME)?.value;
}

export function getAccessCookie() {
  return cookies().get(ACCESS_COOKIE_NAME)?.value;
}

export function loadFingerprintFromCookies() {
  return cookies().get(FINGERPRINT_COOKIE_NAME)?.value ?? undefined;
}

export function persistFingerprintCookie(fingerprint?: string | null) {
  if (!fingerprint) {
    cookies().set(FINGERPRINT_COOKIE_NAME, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return;
  }

  cookies().set(FINGERPRINT_COOKIE_NAME, fingerprint, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export type SessionUser = {
  id: string;
  email: string;
  profileType: "admin" | "facility" | "manufacturer";
  facilityId: string | null;
  manufacturerId: string | null;
  permissions: string[];
};

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const token = getAccessCookie();
    if (!token) return null;
    const payload = verifyAccessToken(token);
    return {
      id: payload.sub,
      email: payload.email,
      profileType: payload.profileType,
      facilityId: payload.facilityId ?? null,
      manufacturerId: payload.manufacturerId ?? null,
      permissions: payload.permissions ?? [],
    };
  } catch (error) {
    console.error("Failed to read session user", error);
    return null;
  }
}

