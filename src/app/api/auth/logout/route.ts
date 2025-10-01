import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { logoutSchema } from "@/lib/auth/schemas";
import { clearSessionCookies } from "@/lib/auth/session";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { withRateLimitHeaders } from "@/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = logoutSchema.parse(body);
    const requestId = crypto.randomUUID();
    const headers = request.headers;

    const identifier = `${parsed.refreshToken.slice(0, 16)}::${headers.get("x-forwarded-for") ?? "unknown"}`;
    const rate = await checkRateLimit({ identifier, section: "auth:refresh" });

    if (!rate.success) {
      throw new HttpError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many logout attempts.",
        status: 429,
      });
    }

    const existing = await prisma.refreshToken.findUnique({
      where: { token: parsed.refreshToken },
      select: { id: true, userId: true },
    });

    if (!existing) {
      throw new HttpError({ code: "AUTH_TOKEN_NOT_FOUND", message: "Session not found", status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: existing.id },
        data: {
          revokedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          user: existing.userId
            ? {
                connect: { id: existing.userId },
              }
            : undefined,
          event: "AUTH_LOGOUT",
          message: "User logged out",
          metadata: {
            fingerprint: parsed.fingerprint,
          },
          ipAddress: headers.get("x-forwarded-for") ?? undefined,
          userAgent: headers.get("user-agent") ?? undefined,
        },
      });
    });

    clearSessionCookies();

    const response = NextResponse.json(
      { success: true },
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

