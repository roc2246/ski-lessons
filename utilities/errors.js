/**
 * Standardized error response for controllers
 *
 * @param {import("express").Response} res
 * @param {number} code - HTTP status code
 * @param {string} message - Custom error message
 * @param {Error} error - Original error object
 */
export function sendError(res, code, message, error) {
  res.status(code).json({
    message,
    error: error?.message || "An unknown error occurred",
  });
}
