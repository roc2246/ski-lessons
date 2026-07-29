import type { Response } from "express";

export interface ErrorResponsePayload {
  message: string;
  error?: string;
  [key: string]: unknown;
}

export type ErrorResponseWriter = Response;

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
