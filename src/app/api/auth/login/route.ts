import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/auth/schemas";
import { verifyPassword } from "@/lib/auth/hash";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { getPermissionsForRole } from "@/lib/auth/permissions";
import { setAccessCookie, setRefreshCookie, ACCESS_COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE } from "@/lib/auth/session";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";
import { getClientIp, getUserAgent } from "@/lib/auth/utils";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { withRateLimitHeaders } from "@/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const requestId = crypto.randomUUID();
    const headers = request.headers;

    const identifier = `${parsed.email.toLowerCase()}::${getClientIp(headers) ?? "unknown"}`;
    const rate = await checkRateLimit({ identifier, section: "auth:login" });

    if (!rate.success) {
      throw new HttpError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts. Please try again later.",
        status: 429,
        details: { section: "auth:login" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { emailNormalized: parsed.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organization: true,
        profileType: true,
        isActive: true,
        passwordCredential: {
          select: { hash: true },
        },
        facilityProfile: {
          select: {
            facilityId: true,
          },
        },
        manufacturerProfile: {
          select: {
            manufacturerId: true,
          },
        },
      },
    });

    if (!user || !user.passwordCredential) {
      throw new HttpError({
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password",
        status: 401,
      });
    }

    if (!user.isActive) {
      throw new HttpError({
        code: "AUTH_ACCOUNT_DISABLED",
        message: "This account is disabled. Contact your administrator.",
        status: 403,
      });
    }

    const passwordValid = await verifyPassword(parsed.password, user.passwordCredential.hash);

    if (!passwordValid) {
      await prisma.auditLog.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          event: "AUTH_LOGIN_FAILURE",
          message: `Failed login attempt for ${user.email}`,
          metadata: { reason: "invalid_credentials" },
          ipAddress: getClientIp(headers),
          userAgent: getUserAgent(headers),
        },
      });

      throw new HttpError({
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid email or password",
        status: 401,
      });
    }

    const permissions = getPermissionsForRole(user.profileType.toLowerCase() as "admin" | "facility" | "manufacturer");
    const facilityId = user.facilityProfile?.facilityId ?? null;
    const manufacturerId = user.manufacturerProfile?.manufacturerId ?? null;

    const normalizedProfileType = user.profileType.toLowerCase() as "admin" | "facility" | "manufacturer";

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      profileType: normalizedProfileType,
      facilityId,
      manufacturerId,
      permissions,
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      email: user.email,
      profileType: normalizedProfileType,
      facilityId,
      manufacturerId,
      permissions,
    });

    const userAgent = getUserAgent(headers);
    const ipAddress = getClientIp(headers);

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          fingerprint: parsed.fingerprint,
          userAgent,
          ipAddress,
          expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE * 1000),
        },
      });

      await tx.auditLog.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          event: "AUTH_LOGIN_SUCCESS",
          message: `User ${user.email} logged in`,
          ipAddress,
          userAgent,
          metadata: {
            rememberMe: parsed.rememberMe,
          },
        },
      });
    });

    setAccessCookie(accessToken, ACCESS_COOKIE_MAX_AGE);
    if (parsed.rememberMe) {
      setRefreshCookie(refreshToken, REFRESH_COOKIE_MAX_AGE);
    } else {
      setRefreshCookie(refreshToken, 0);
    }

    const response = NextResponse.json(
      {
        accessToken,
        refreshToken,
        expiresIn: 60 * 15,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileType: normalizedProfileType,
          organization: user.organization,
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

