export function withRateLimitHeaders(response: Response, rateInfo?: { limit: number; remaining: number; reset: number }) {
  if (!rateInfo) return response;

  response.headers.set("x-ratelimit-limit", rateInfo.limit.toString());
  response.headers.set("x-ratelimit-remaining", rateInfo.remaining.toString());
  response.headers.set("x-ratelimit-reset", rateInfo.reset.toString());
  return response;
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

// Result object from data-access layer
type DataAccessResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

// Overload 1: Accept data-access result object
export function toPaginatedResponse<T>(result: DataAccessResult<T>): PaginatedResponse<T>;
// Overload 2: Accept individual parameters (legacy)
export function toPaginatedResponse<T>(data: T[], page: number, pageSize: number, totalCount: number): PaginatedResponse<T>;

// Implementation
export function toPaginatedResponse<T>(
  dataOrResult: T[] | DataAccessResult<T>,
  page?: number,
  pageSize?: number,
  totalCount?: number,
): PaginatedResponse<T> {
  // If first parameter is an object with items, it's a result object
  if (typeof dataOrResult === "object" && dataOrResult !== null && "items" in dataOrResult) {
    const result = dataOrResult as DataAccessResult<T>;
    return {
      data: result.items,
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasNextPage: result.hasNextPage,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    };
  }

  // Otherwise, it's the legacy signature with individual parameters
  const data = dataOrResult as T[];
  return {
    data,
    meta: {
      page: page!,
      pageSize: pageSize!,
      total: totalCount!,
      hasNextPage: (page! - 1) * pageSize! + data.length < totalCount!,
      totalPages: Math.ceil(totalCount! / pageSize!),
    },
  };
}

