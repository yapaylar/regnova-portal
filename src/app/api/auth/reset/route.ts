import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { hashPassword } from "@/lib/auth/hash";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";
import { getClientIp, getUserAgent } from "@/lib/auth/utils";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import { withRateLimitHeaders } from "@/lib/http/response";

const PASSWORD_RESET_WINDOW_MINUTES = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.parse(body);
    const requestId = crypto.randomUUID();
    const headers = request.headers;

    const identifier = `${parsed.token.slice(0, 16)}::${getClientIp(headers) ?? "unknown"}`;
    const rate = await checkRateLimit({ identifier, section: "auth:forgot" });

    if (!rate.success) {
      throw new HttpError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many reset attempts. Please try again later.",
        status: 429,
        details: { section: "auth:forgot" },
      });
    }

    const existingToken = await prisma.verificationToken.findUnique({
      where: { token: parsed.token },
      select: {
        id: true,
        userId: true,
        type: true,
        expiresAt: true,
        consumedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!existingToken || existingToken.type !== "PASSWORD_RESET") {
      throw new HttpError({ code: "AUTH_INVALID_TOKEN", message: "Invalid or expired token", status: 400 });
    }

    if (existingToken.consumedAt || existingToken.expiresAt < new Date()) {
      throw new HttpError({ code: "AUTH_INVALID_TOKEN", message: "Token is expired", status: 400 });
    }

    if (!existingToken.user || !existingToken.user.isActive) {
      throw new HttpError({ code: "AUTH_ACCOUNT_DISABLED", message: "Account disabled", status: 403 });
    }

    const hashedPassword = await hashPassword(parsed.password);
    const userAgent = getUserAgent(headers);
    const ipAddress = getClientIp(headers);

    await prisma.$transaction(async (tx) => {
      await tx.passwordCredential.upsert({
        where: { userId: existingToken.userId },
        update: { hash: hashedPassword, updatedAt: new Date() },
        create: {
          userId: existingToken.userId,
          hash: hashedPassword,
        },
      });

      await tx.verificationToken.update({
        where: { id: existingToken.id },
        data: { consumedAt: new Date() },
      });

      await tx.refreshToken.updateMany({
        where: { userId: existingToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          userId: existingToken.userId,
          event: "AUTH_PASSWORD_RESET",
          message: `Password reset for ${existingToken.user.email}`,
          ipAddress,
          userAgent,
        },
      });
    });

    const response = NextResponse.json(
      {
        success: true,
        expiresInMinutes: PASSWORD_RESET_WINDOW_MINUTES,
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

