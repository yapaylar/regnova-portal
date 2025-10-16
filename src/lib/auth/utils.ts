import crypto from "node:crypto";

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getFingerprint(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return null;
  const value = metadata["fingerprint"];
  return typeof value === "string" ? value : null;
}

export function getMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  if (!metadata) return undefined;
  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const [ip] = forwarded.split(",");
    if (ip) return ip.trim();
  }
  return headers.get("x-real-ip") ?? undefined;
}

export function getUserAgent(headers: Headers) {
  return headers.get("user-agent") ?? undefined;
}

