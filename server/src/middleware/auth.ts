import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";
import * as models from "../models/index.js";

interface AuthenticatedUser {
  userId: string;
  username?: string;
  admin?: boolean;
}

type AuthRequest = Request & {
  user?: AuthenticatedUser;
  token?: string;
};

function hasName(error: unknown): error is { name: string } {
  return typeof error === "object" && error !== null && "name" in error && typeof (error as { name?: unknown }).name === "string";
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
  const authReq = req as AuthRequest;

  try {
    const authHeader = authReq.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return utilities.sendError(res, 401, "Unauthorized: Invalid token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "development-secret");
    if (!isAuthenticatedUserPayload(decoded)) {
      throw new Error("Invalid token payload");
    }

    const blacklisted = await models.isTokenBlacklisted(token);
    if (blacklisted) {
      return utilities.sendError(res, 401, "Unauthorized: Token has been revoked");
    }

    authReq.user = {
      userId: decoded.userId,
      ...(typeof decoded.username === "string" ? { username: decoded.username } : {}),
      ...(typeof decoded.admin === "boolean" ? { admin: decoded.admin } : {}),
    };
    authReq.token = token;
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

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;

  if (authReq.user?.admin !== true) {
    return utilities.sendError(res, 403, "Forbidden: Admin access required");
  }
  next();
}
