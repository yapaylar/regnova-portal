type ErrorOptions = {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor({ code, message, status = 400, details }: ErrorOptions) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function createErrorResponse(error: HttpError, requestId?: string) {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
    },
  };
}

export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error && "message" in error) {
    return new HttpError({ code: "INTERNAL_SERVER_ERROR", message: error.message, status: 500 });
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return new HttpError({
      code: "INTERNAL_SERVER_ERROR",
      message: String((error as { message: unknown }).message),
      status: 500,
    });
  }

  return new HttpError({ code: "INTERNAL_SERVER_ERROR", message: "Unexpected error", status: 500 });
}

