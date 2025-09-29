import { cookies } from "next/headers";

const ACCESS_COOKIE_NAME = "regnova.access";
const REFRESH_COOKIE_NAME = "regnova.refresh";

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
}

export function getRefreshCookie() {
  return cookies().get(REFRESH_COOKIE_NAME)?.value;
}

export function getAccessCookie() {
  return cookies().get(ACCESS_COOKIE_NAME)?.value;
}

