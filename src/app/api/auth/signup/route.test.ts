import { NextResponse } from "next/server";

import { POST } from "./route";

jest.mock("@/lib/prisma", () => {
  const mockTx = {
    user: { create: jest.fn() },
    facilityProfile: { create: jest.fn() },
    manufacturerProfile: { create: jest.fn() },
    refreshToken: { create: jest.fn() },
    auditLog: { create: jest.fn() },
  };

  return {
    prisma: {
      user: { findUnique: jest.fn() },
      $transaction: jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown> | unknown) => fn(mockTx)),
    },
    __mockTx: mockTx,
  };
});

jest.mock("@/lib/auth/hash", () => ({ hashPassword: jest.fn().mockResolvedValue("hashed-pass") }));
jest.mock("@/lib/auth/jwt", () => ({
  signAccessToken: jest.fn().mockReturnValue("access-token"),
  signRefreshToken: jest.fn().mockReturnValue("refresh-token"),
}));
jest.mock("@/lib/auth/permissions", () => ({ getPermissionsForRole: jest.fn().mockReturnValue(["report:create"]) }));
jest.mock("@/lib/auth/session", () => ({
  setAccessCookie: jest.fn(),
  setRefreshCookie: jest.fn(),
  REFRESH_COOKIE_MAX_AGE: 60,
  ACCESS_COOKIE_MAX_AGE: 30,
}));
jest.mock("@/lib/auth/profile", () => ({
  resolveProfile: jest.fn().mockReturnValue({
    organization: "Regnova HQ",
    facilityConnectId: null,
    manufacturerConnectId: null,
    createFacility: null,
    createManufacturer: null,
  }),
}));

jest.mock("@/lib/auth/utils", () => ({
  generateRefreshToken: jest.fn().mockReturnValue("stored-refresh-token"),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
  getUserAgent: jest.fn().mockReturnValue("Jest"),
}));

jest.mock("@/lib/rate-limit/redis", () => ({
  checkRateLimit: jest.fn(),
}));

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_ACCESS_TOKEN_SECRET = "test-access-secret-32chars-long";
    process.env.AUTH_REFRESH_TOKEN_SECRET = "test-refresh-secret-32chars-long";
    process.env.AUTH_ACCESS_TOKEN_TTL = "15m";
    process.env.AUTH_REFRESH_TOKEN_TTL = "30d";
  });

  it("returns 201 for successful signup", async () => {
    const { prisma, __mockTx } = jest.requireMock("@/lib/prisma");
    const { checkRateLimit } = jest.requireMock("@/lib/rate-limit/redis");
    checkRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 1000,
    });
    prisma.user.findUnique.mockResolvedValue(null);
    __mockTx.user.create.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      organization: "Regnova HQ",
      profileType: "ADMIN",
    });

    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "Regnova123",
        confirmPassword: "Regnova123",
        profileType: "admin",
        firstName: "Test",
        lastName: "User",
        organization: "Regnova HQ",
        termsAccepted: true,
      }),
    });

    const response = (await POST(request)) as NextResponse;
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.accessToken).toBe("access-token");
    expect(response.headers.get("x-ratelimit-limit")).toBe("5");
    expect(response.headers.get("x-ratelimit-remaining")).toBe("4");
  });

  it("returns 409 when email already exists", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma");
    prisma.user.findUnique.mockResolvedValue({ id: "user_existing" });

    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "Regnova123",
        confirmPassword: "Regnova123",
        profileType: "admin",
        firstName: "Test",
        lastName: "User",
        organization: "Regnova HQ",
        termsAccepted: true,
      }),
    });

    const response = (await POST(request)) as NextResponse;
    expect(response.status).toBe(409);
    const payload = await response.json();
    expect(payload.error.code).toBe("AUTH_EMAIL_EXISTS");
  });

  it("returns 429 when rate limit exceeded", async () => {
    const { checkRateLimit } = jest.requireMock("@/lib/rate-limit/redis");
    checkRateLimit.mockResolvedValueOnce({ success: false, limit: 5, remaining: 0, reset: Date.now() + 1000 });

    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "Regnova123",
        confirmPassword: "Regnova123",
        profileType: "admin",
        firstName: "Test",
        lastName: "User",
        organization: "Regnova HQ",
        termsAccepted: true,
      }),
    });

    const response = (await POST(request)) as NextResponse;
    expect(response.status).toBe(429);
  });
});

