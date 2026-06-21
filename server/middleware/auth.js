import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";

/**
 * Middleware to authenticate JWT tokens from Authorization header.
 * Attaches decoded user object to req.user for use in controllers.
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user to request
    next();
  } catch (error) {
    return utilities.sendError(res, 401, "Unauthorized: Invalid token", error);
  }
}

/**
 * Middleware to require admin role.
 * Must be used after authenticate middleware.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.admin !== true) {
    return utilities.sendError(res, 403, "Forbidden: Admin access required");
  }
  next();
}
