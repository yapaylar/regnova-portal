import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/auth/env";

const redis = env.RATE_LIMIT_REDIS_URL ? Redis.fromEnv() : null;

type SlidingWindow = `${number}${"s" | "m" | "h"}`;

const LIMIT_CONFIG: Record<RateLimitKey["section"], { window: SlidingWindow; points: number }> = {
  "auth:signup": { window: "1h", points: 5 },
  "auth:login": { window: "5m", points: 10 },
  "auth:refresh": { window: "5m", points: 30 },
  "auth:forgot": { window: "15m", points: 5 },
};

const FALLBACK_LIMIT: { window: SlidingWindow; points: number } = { window: "1m", points: 10 };

export type RateLimitKey = {
  identifier: string;
  section: "auth:signup" | "auth:login" | "auth:refresh" | "auth:forgot";
};

export async function checkRateLimit({ identifier, section }: RateLimitKey) {
  if (!redis) return { success: true };

  const limiter = getLimiter(section);
  const { success, limit, reset, remaining } = await limiter.limit(identifier);
  return { success, limit, reset, remaining };
}

function getLimiter(section: RateLimitKey["section"]) {
  const config = LIMIT_CONFIG[section] ?? FALLBACK_LIMIT;
  return new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(config.points, config.window),
    analytics: true,
    prefix: section,
  });
}

