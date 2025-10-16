import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { HttpError, createErrorResponse, toHttpError } from "@/lib/http/errors";
import { generateVerificationToken, getClientIp, getUserAgent } from "@/lib/auth/utils";
import { checkRateLimit } from "@?/lib/rate-limit/redis";
import { withRateLimitHeaders } from "@?/lib/http/response";
import { sendPasswordResetEmail } from "@/lib/notifications/email";

const PASSWORD_RESET_WINDOW_MINUTES = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.parse(body);
    const requestId = crypto.randomUUID();
    const headers = request.headers;

    const identifier = `${parsed.email.toLowerCase()}::${getClientIp(headers) ?? "unknown"}`;
    const rate = await checkRateLimit({ identifier, section: "auth:forgot" });

    if (!rate.success) {
      throw new HttpError({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many reset requests. Please try again later.",
        status: 429,
        details: { section: "auth:forgot" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { emailNormalized: parsed.email.toLowerCase() },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      // Return generic response for security
      const response = NextResponse.json({ success: true }, {
        status: 200,
        headers: {
          "x-request-id": requestId,
        },
      });

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
    }

    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_WINDOW_MINUTES * 60 * 1000);
    const userAgent = getUserAgent(headers);
    const ipAddress = getClientIp(headers);

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          type: "PASSWORD_RESET",
          token: resetToken,
          expiresAt,
          metadata: {
            userAgent,
            ipAddress,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          event: "AUTH_PASSWORD_RESET",
          message: `Password reset requested for ${user.email}`,
          ipAddress,
          userAgent,
        },
      });
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      expiresInMinutes: PASSWORD_RESET_WINDOW_MINUTES,
    });

    const response = NextResponse.json({ success: true }, {
      status: 200,
      headers: {
        "x-request-id": requestId,
      },
    });

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

