export function withRateLimitHeaders(response: Response, rateInfo?: { limit: number; remaining: number; reset: number }) {
  if (!rateInfo) return response;

  response.headers.set("x-ratelimit-limit", rateInfo.limit.toString());
  response.headers.set("x-ratelimit-remaining", rateInfo.remaining.toString());
  response.headers.set("x-ratelimit-reset", rateInfo.reset.toString());
  return response;
}

