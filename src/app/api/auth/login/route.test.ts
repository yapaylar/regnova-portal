import { NextResponse } from "next/server";

import { POST } from "./route";

jest.mock("@/lib/prisma", () => {
  const mockTx = {
    refreshToken: { create: jest.fn() },
    auditLog: { create: jest.fn() },
  };

  const prismaMock = {
    user: { findUnique: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn((fn: (tx: typeof mockTx) => any) => fn(mockTx)),
  };

  return {
    prisma: prismaMock,
    __mockTx: mockTx,
  };
});

jest.mock("@/lib/auth/hash", () => ({ verifyPassword: jest.fn().mockResolvedValue(true) }));
jest.mock("@/lib/auth/jwt", () => ({
  signAccessToken: jest.fn().mockReturnValue("access-token"),
  signRefreshToken: jest.fn().mockReturnValue("refresh-token"),
}));
jest.mock("@/lib/auth/permissions", () => ({ getPermissionsForRole: jest.fn().mockReturnValue(["report:create"]) }));
jest.mock("@/lib/auth/session", () => ({
  setAccessCookie: jest.fn(),
  setRefreshCookie: jest.fn(),
  ACCESS_COOKIE_MAX_AGE: 900,
  REFRESH_COOKIE_MAX_AGE: 2592000,
}));
jest.mock("@/lib/auth/utils", () => ({
  generateRefreshToken: jest.fn().mockReturnValue("stored-refresh"),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
  getUserAgent: jest.fn().mockReturnValue("Jest"),
}));

jest.mock("@/lib/rate-limit/redis", () => ({ checkRateLimit: jest.fn().mockResolvedValue({
  success: true,
  limit: 10,
  remaining: 9,
  reset: Date.now() + 1000,
}) }));

describe("POST /api/auth/login", () => {
  const basePayload = {
    email: "user@example.com",
    password: "Regnova123",
    rememberMe: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_ACCESS_TOKEN_SECRET = "test-access-secret-32chars-long";
    process.env.AUTH_REFRESH_TOKEN_SECRET = "test-refresh-secret-32chars-long";
  });

  it("logs in successfully", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma");
    const { checkRateLimit } = jest.requireMock("@/lib/rate-limit/redis");
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      organization: "Regnova HQ",
      profileType: "ADMIN",
      isActive: true,
      passwordCredential: { hash: "hashed" },
      facilityProfile: null,
      manufacturerProfile: null,
    });
    checkRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 1000 });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload),
    });

    const response = (await POST(request)) as NextResponse;
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.accessToken).toBe("access-token");
  });

  it("returns 401 for invalid credentials", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma");
    const { verifyPassword } = jest.requireMock("@/lib/auth/hash");
    const { checkRateLimit } = jest.requireMock("@/lib/rate-limit/redis");
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      organization: "Regnova HQ",
      profileType: "ADMIN",
      isActive: true,
      passwordCredential: { hash: "hashed" },
      facilityProfile: null,
      manufacturerProfile: null,
    });
    verifyPassword.mockResolvedValueOnce(false);
    checkRateLimit.mockResolvedValue({ success: true });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload),
    });

    const response = (await POST(request)) as NextResponse;
    expect(response.status).toBe(401);
  });

  it("returns 403 when account disabled", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma");
    const { checkRateLimit } = jest.requireMock("@/lib/rate-limit/redis");
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      organization: "Regnova HQ",
      profileType: "ADMIN",
      isActive: false,
      passwordCredential: { hash: "hashed" },
      facilityProfile: null,
      manufacturerProfile: null,
    });
    checkRateLimit.mockResolvedValue({ success: true });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload),
    });

    const response = (await POST(request)) as NextResponse;
    expect(response.status).toBe(403);
  });
});

