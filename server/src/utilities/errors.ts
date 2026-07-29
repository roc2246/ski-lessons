export interface ErrorResponsePayload {
  message: string;
  error: string;
}

export interface ErrorResponseWriter {
  status(code: number): {
    json(body: ErrorResponsePayload): unknown;
  };
}

export function sendError(
  res: ErrorResponseWriter,
  code: number,
  message: string,
  error?: Error | unknown
): void {
  if (error && code >= 500) {
    console.error(`[${code}] ${message}:`, error);
  }

  const isClientError = code >= 400 && code < 500;

  res.status(code).json({
    message,
    error: isClientError
      ? (error instanceof Error ? error.message : undefined) || message || "Bad request"
      : "An internal error occurred",
  });
}
