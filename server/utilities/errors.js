/**
 * Standardized error response for controllers
 *
 * @param {import("express").Response} res
 * @param {number} code - HTTP status code
 * @param {string} message - Custom error message
 * @param {Error} error - Original error object
 */
export function sendError(res, code, message, error) {
  if (error) console.error(`[${code}] ${message}:`, error);
  const isClientError = code >= 400 && code < 500;
  res.status(code).json({
    message,
    error: isClientError
      ? (error?.message || "Bad request")
      : "An internal error occurred",
  });
}
