import { signAccessToken, verifyAccessToken } from "./jwt";

describe("JWT helpers", () => {
  beforeAll(() => {
    process.env.AUTH_ACCESS_TOKEN_SECRET = "test-access-secret-32chars-long";
    process.env.AUTH_REFRESH_TOKEN_SECRET = "test-refresh-secret-32chars-long";
  });

  it("signs and verifies access tokens", () => {
    const token = signAccessToken({
      sub: "user-1",
      email: "user@example.com",
      profileType: "admin",
      facilityId: null,
      manufacturerId: null,
      permissions: ["report:create"],
    }, { expiresIn: "1h" });

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe("user-1");
    expect(decoded.email).toBe("user@example.com");
    expect(decoded.tokenType).toBe("access");
  });
});

