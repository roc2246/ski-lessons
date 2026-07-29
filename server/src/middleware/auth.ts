import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";
import * as models from "../models/index.js";

interface AuthenticatedUser {
  userId: string;
  username?: string;
  admin?: boolean;
}

interface AuthRequest {
  headers?: { authorization?: string };
  user?: AuthenticatedUser;
  token?: string;
}

function hasName(error: unknown): error is { name: string } {
  return typeof error === "object" && error !== null && "name" in error && typeof (error as { name?: unknown }).name === "string";
}

export async function authenticate(req: AuthRequest, res: utilities.ErrorResponseWriter, next: () => void) {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return utilities.sendError(res, 401, "Unauthorized: Invalid token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "development-secret");
    const userPayload = decoded as unknown;
    const normalizedUser = userPayload as Partial<AuthenticatedUser>;
    if (!normalizedUser.userId) {
      throw new Error("Invalid token payload");
    }

    const blacklisted = await models.isTokenBlacklisted(token);
    if (blacklisted) {
      return utilities.sendError(res, 401, "Unauthorized: Token has been revoked");
    }

    req.user = {
      userId: normalizedUser.userId,
      ...(typeof normalizedUser.username === "string" ? { username: normalizedUser.username } : {}),
      ...(typeof normalizedUser.admin === "boolean" ? { admin: normalizedUser.admin } : {}),
    };
    req.token = token;
    next();
  } catch (error) {
    if (hasName(error) && error.name === "TokenExpiredError") {
      return utilities.sendError(res, 401, "Unauthorized: Token expired");
    }

    if (hasName(error) && (error.name === "JsonWebTokenError" || error.name === "NotBeforeError")) {
      return utilities.sendError(res, 401, "Unauthorized: Invalid token");
    }

    return utilities.sendError(res, 401, "Unauthorized: Invalid token", error);
  }
}

export function requireAdmin(req: { user?: { admin?: boolean } }, res: utilities.ErrorResponseWriter, next: () => void) {
  if (req.user?.admin !== true) {
    return utilities.sendError(res, 403, "Forbidden: Admin access required");
  }
  next();
}
