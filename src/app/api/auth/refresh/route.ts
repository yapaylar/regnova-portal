import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { refreshSchema } from "@/lib/auth/schemas";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { getPermissionsForRole } from "@/lib/auth/permissions";
import { persistFingerprintCookie, setAccessCookie, setRefreshCookie, ACCESS_COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE } from "@/lib/auth/session";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";
import { generateRefreshToken, getClientIp, getUserAgent } from "@/lib/auth/utils";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { withRateLimitHeaders } from "@/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = refreshSchema.parse(body);
    const requestId = crypto.randomUUID();
    const headers = request.headers;

    const identifier = `${parsed.refreshToken.slice(0, 16)}::${getClientIp(headers) ?? "unknown"}`;
    const rate = await checkRateLimit({ identifier, section: "auth:refresh" });

    if (!rate.success) {
      throw new HttpError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many refresh attempts. Please try again later.",
        status: 429,
        details: { section: "auth:refresh" },
      });
    }

    const decoded = verifyRefreshToken(parsed.refreshToken);

    if (decoded.tokenType !== "refresh") {
      throw new HttpError({ code: "AUTH_INVALID_TOKEN", message: "Invalid token", status: 401 });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: parsed.refreshToken },
      select: {
        id: true,
        userId: true,
        revokedAt: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            organization: true,
            profileType: true,
            isActive: true,
            facilityProfile: { select: { facilityId: true } },
            manufacturerProfile: { select: { manufacturerId: true } },
          },
        },
      },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new HttpError({ code: "AUTH_TOKEN_REVOKED", message: "Token is expired or revoked", status: 401 });
    }

    if (!storedToken.user || !storedToken.user.isActive) {
      throw new HttpError({ code: "AUTH_ACCOUNT_DISABLED", message: "Account disabled", status: 403 });
    }

    const permissions = getPermissionsForRole(storedToken.user.profileType.toLowerCase() as "admin" | "facility" | "manufacturer");
    const facilityId = storedToken.user.facilityProfile?.facilityId ?? null;
    const manufacturerId = storedToken.user.manufacturerProfile?.manufacturerId ?? null;

    const accessToken = signAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      profileType: storedToken.user.profileType.toLowerCase() as "admin" | "facility" | "manufacturer",
      facilityId,
      manufacturerId,
      permissions,
    });

    const shouldRotate = true;
    let refreshToken = parsed.refreshToken;

    if (shouldRotate) {
      refreshToken = signRefreshToken({
        sub: storedToken.user.id,
        email: storedToken.user.email,
        profileType: storedToken.user.profileType.toLowerCase() as "admin" | "facility" | "manufacturer",
        facilityId,
        manufacturerId,
        permissions,
      });

      await prisma.$transaction(async (tx) => {
        await tx.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });

        const newRefreshTokenValue = generateRefreshToken();

        await tx.refreshToken.create({
          data: {
            userId: storedToken.user.id,
            token: newRefreshTokenValue,
            fingerprint: parsed.fingerprint,
            userAgent: getUserAgent(headers),
            ipAddress: getClientIp(headers),
            expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE * 1000),
          },
        });

        await tx.auditLog.create({
          data: {
            user: {
              connect: { id: storedToken.user.id },
            },
            event: "AUTH_TOKEN_REFRESH",
            message: `Refresh token rotated for user ${storedToken.user.email}`,
            ipAddress: getClientIp(headers),
            userAgent: getUserAgent(headers),
          },
        });
      });
    }

    setAccessCookie(accessToken, ACCESS_COOKIE_MAX_AGE);
    persistFingerprintCookie(parsed.fingerprint ?? null);
    setRefreshCookie(refreshToken, REFRESH_COOKIE_MAX_AGE);

    const response = NextResponse.json(
      {
        accessToken,
        refreshToken,
        expiresIn: 60 * 15,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          firstName: storedToken.user.firstName,
          lastName: storedToken.user.lastName,
          profileType: storedToken.user.profileType.toLowerCase(),
          organization: storedToken.user.organization,
          facilityId,
          manufacturerId,
          permissions,
        },
      },
      {
        status: 200,
        headers: {
          "x-request-id": requestId,
        },
      },
    );

    return withRateLimitHeaders(
      response,
      rate.success && rate.limit !== undefined && rate.remaining !== undefined && rate.reset !== undefined
        ? {
            limit: rate.limit,
            remaining: rate.remaining,
            reset: Math.floor(rate.reset / 1000),
          }
        : undefined,
    );
  } catch (error) {
    const httpError = toHttpError(error);
    const requestId = crypto.randomUUID();
    return NextResponse.json(createErrorResponse(httpError, requestId), {
      status: httpError.status,
      headers: {
        "x-request-id": requestId,
      },
    });
  }
}

