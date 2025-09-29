import "@testing-library/jest-dom";

process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/regnova_test?schema=public";
process.env.AUTH_ACCESS_TOKEN_SECRET ??= "test-access-secret-32chars-long".padEnd(32, "x");
process.env.AUTH_REFRESH_TOKEN_SECRET ??= "test-refresh-secret-32chars-long".padEnd(32, "y");
process.env.AUTH_ACCESS_TOKEN_TTL ??= "15m";
process.env.AUTH_REFRESH_TOKEN_TTL ??= "30d";

beforeEach(() => {
  jest.clearAllMocks();
});

