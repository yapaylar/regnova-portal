import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/auth/schemas";
import { hashPassword } from "@/lib/auth/hash";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { getPermissionsForRole } from "@/lib/auth/permissions";
import { setAccessCookie, setRefreshCookie, REFRESH_COOKIE_MAX_AGE, ACCESS_COOKIE_MAX_AGE } from "@/lib/auth/session";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";
import { resolveProfile } from "@/lib/auth/profile";
import { generateRefreshToken, getClientIp, getUserAgent } from "@/lib/auth/utils";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { withRateLimitHeaders } from "@/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.parse(body);

    const requestId = crypto.randomUUID();
    const headers = request.headers;

    const identifier = `${parsed.email.toLowerCase()}::${getClientIp(request.headers) ?? "unknown"}`;
    const rate = await checkRateLimit({ identifier, section: "auth:signup" });

    if (!rate.success) {
      throw new HttpError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many signup attempts. Please try again later.",
        status: 429,
        details: { section: "auth:signup" },
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { emailNormalized: parsed.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new HttpError({
        code: "AUTH_EMAIL_EXISTS",
        message: "An account with this email already exists.",
        status: 409,
      });
    }

    const hashedPassword = await hashPassword(parsed.password);
    const permissions = getPermissionsForRole(parsed.profileType);
    const profileResolution = resolveProfile({
      profileType: parsed.profileType,
      organization: parsed.organization,
      metadata: parsed.metadata,
    });

    const refreshTokenValue = generateRefreshToken();
    const userAgent = getUserAgent(headers);
    const ipAddress = getClientIp(headers);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: parsed.email,
          emailNormalized: parsed.email.toLowerCase(),
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          organization: profileResolution.organization,
          profileType: parsed.profileType.toUpperCase() as "ADMIN" | "FACILITY" | "MANUFACTURER",
          passwordCredential: {
            create: {
              hash: hashedPassword,
            },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
          profileType: true,
        },
      });

      if (profileResolution.facilityConnectId || profileResolution.createFacility) {
        // Create facility if needed
        const facility = profileResolution.facilityConnectId
          ? await tx.facility.findUnique({ where: { id: profileResolution.facilityConnectId }, select: { id: true } })
          : await tx.facility.create({
              data: {
                name: profileResolution.organization,
                slug: profileResolution.createFacility?.slug ?? crypto.randomUUID(),
              },
              select: { id: true },
            });

        // Create facility registration for admin approval
        await tx.facilityRegistration.create({
          data: {
            userId: user.id,
            facilityId: facility?.id ?? null,
            status: "PENDING",
            metadata: parsed.metadata,
          },
        });
      } else if (profileResolution.manufacturerConnectId || profileResolution.createManufacturer) {
        // Create manufacturer if needed
        const manufacturer = profileResolution.manufacturerConnectId
          ? await tx.manufacturer.findUnique({ where: { id: profileResolution.manufacturerConnectId }, select: { id: true } })
          : await tx.manufacturer.create({
              data: {
                name: profileResolution.organization,
                slug: profileResolution.createManufacturer?.slug ?? crypto.randomUUID(),
              },
              select: { id: true },
            });

        // Create manufacturer registration for admin approval
        await tx.manufacturerRegistration.create({
          data: {
            userId: user.id,
            manufacturerId: manufacturer?.id ?? null,
            status: "PENDING",
            metadata: parsed.metadata,
          },
        });
      }

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshTokenValue,
          fingerprint: parsed.metadata?.fingerprint as string | undefined,
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
          event: "AUTH_SIGNUP",
          message: `User ${user.email} signed up as ${parsed.profileType}`,
          ipAddress,
          userAgent,
          metadata: {
            profileType: parsed.profileType,
            organization: parsed.organization,
          },
        },
      });

      return user;
    });

    const normalizedProfileType = parsed.profileType;
    const facilityId = profileResolution.facilityConnectId ?? null;
    const manufacturerId = profileResolution.manufacturerConnectId ?? null;

    const accessToken = signAccessToken({
      sub: createdUser.id,
      email: createdUser.email,
      profileType: normalizedProfileType,
      facilityId,
      manufacturerId,
      permissions,
    });

    const refreshToken = signRefreshToken({
      sub: createdUser.id,
      email: createdUser.email,
      profileType: normalizedProfileType,
      facilityId,
      manufacturerId,
      permissions,
    });

    setAccessCookie(accessToken, ACCESS_COOKIE_MAX_AGE);
    setRefreshCookie(refreshToken, REFRESH_COOKIE_MAX_AGE);

    const response = NextResponse.json(
      {
        accessToken,
        refreshToken,
        expiresIn: 60 * 15,
        requiresVerification: false,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          profileType: normalizedProfileType,
          organization: createdUser.organization,
          facilityId,
          manufacturerId,
          permissions,
        },
      },
      {
        status: 201,
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

