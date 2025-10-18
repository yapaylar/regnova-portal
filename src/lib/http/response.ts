export function withRateLimitHeaders(response: Response, rateInfo?: { limit: number; remaining: number; reset: number }) {
  if (!rateInfo) return response;

  response.headers.set("x-ratelimit-limit", rateInfo.limit.toString());
  response.headers.set("x-ratelimit-remaining", rateInfo.remaining.toString());
  response.headers.set("x-ratelimit-reset", rateInfo.reset.toString());
  return response;
}

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

export function toPaginatedResponse<T>(data: T[], page: number, pageSize: number, totalCount: number): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

