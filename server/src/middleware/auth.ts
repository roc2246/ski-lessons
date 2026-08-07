import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as services from "../services/index.js";
import { sendError } from "../utilities/index.js";
import { getJwtSecret } from "../utilities/config.js";
import { getErrorStatus, hasErrorName } from "../utilities/type-guards.js";

interface AuthenticatedUser {
  userId: string;
  username?: string;
  admin?: boolean;
}

function isAuthenticatedUserPayload(value: unknown): value is AuthenticatedUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  if (typeof payload.userId !== "string" || !payload.userId) {
    return false;
  }

  if ("username" in payload && payload.username !== undefined && typeof payload.username !== "string") {
    return false;
  }

  if ("admin" in payload && payload.admin !== undefined && typeof payload.admin !== "boolean") {
    return false;
  }

  return true;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(res, 401, "Unauthorized: Invalid token");
    }

    const decoded = jwt.verify(token, getJwtSecret());
    if (!isAuthenticatedUserPayload(decoded)) {
      throw new Error("Invalid token payload");
    }

    const blacklisted = await services.isTokenBlacklisted(token);
    if (blacklisted) {
      return sendError(res, 401, "Unauthorized: Token has been revoked");
    }

    req.user = {
      userId: decoded.userId,
      ...(typeof decoded.username === "string" ? { username: decoded.username } : {}),
      ...(typeof decoded.admin === "boolean" ? { admin: decoded.admin } : {}),
    };
    req.token = token;
    next();
  } catch (error) {
    const status = getErrorStatus(error, 401);

    if (status >= 500) {
      return sendError(res, status, "Authorization check failed", error);
    }

    if (hasErrorName(error) && error.name === "TokenExpiredError") {
      return sendError(res, 401, "Unauthorized: Token expired");
    }

    if (hasErrorName(error) && (error.name === "JsonWebTokenError" || error.name === "NotBeforeError")) {
      return sendError(res, 401, "Unauthorized: Invalid token");
    }

    return sendError(res, 401, "Unauthorized: Invalid token", error);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.admin !== true) {
    return sendError(res, 403, "Forbidden: Admin access required");
  }
  next();
}
