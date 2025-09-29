import jwt from "jsonwebtoken";

import { env } from "@/lib/auth/env";

type SignOptions = {
  expiresIn?: string | number;
  subject?: string;
};

const ACCESS_TOKEN_TTL = env.AUTH_ACCESS_TOKEN_TTL ?? process.env.ACCESS_TOKEN_TTL ?? "15m";
const REFRESH_TOKEN_TTL = env.AUTH_REFRESH_TOKEN_TTL ?? process.env.REFRESH_TOKEN_TTL ?? "30d";
const ACCESS_SECRET = env.AUTH_ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = env.AUTH_REFRESH_TOKEN_SECRET;

type JwtPayload = {
  sub: string;
  email: string;
  profileType: "admin" | "facility" | "manufacturer";
  facilityId?: string | null;
  manufacturerId?: string | null;
  permissions: string[];
  tokenType: "access" | "refresh";
};

export function signAccessToken(payload: Omit<JwtPayload, "tokenType">, options: SignOptions = {}) {
  return jwt.sign(
    { ...payload, tokenType: "access" },
    ACCESS_SECRET,
    { expiresIn: options.expiresIn ?? ACCESS_TOKEN_TTL },
  );
}

export function signRefreshToken(payload: Omit<JwtPayload, "tokenType">, options: SignOptions = {}) {
  return jwt.sign(
    { ...payload, tokenType: "refresh" },
    REFRESH_SECRET,
    { expiresIn: options.expiresIn ?? REFRESH_TOKEN_TTL },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function decodeToken(token: string) {
  return jwt.decode(token) as JwtPayload | null;
}

