import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_ACCESS_TOKEN_SECRET: z.string().min(32),
  AUTH_REFRESH_TOKEN_SECRET: z.string().min(32),
  AUTH_ACCESS_TOKEN_TTL: z.string().optional(),
  AUTH_REFRESH_TOKEN_TTL: z.string().optional(),
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse({
  ...process.env,
  AUTH_ACCESS_TOKEN_TTL: process.env.AUTH_ACCESS_TOKEN_TTL ?? process.env.ACCESS_TOKEN_TTL,
  AUTH_REFRESH_TOKEN_TTL: process.env.AUTH_REFRESH_TOKEN_TTL ?? process.env.REFRESH_TOKEN_TTL,
});

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

