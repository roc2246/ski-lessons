import type { NextFunction, Request, Response } from "express";

function sanitizeObject(target: unknown): unknown {
  if (!target || typeof target !== "object") {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(target as Record<string, unknown>)) {
    const cleanKey = key.replace(/\$|\./g, "");
    sanitized[cleanKey] = sanitizeObject(value);
  }

  return sanitized;
}

function setRequestProperty(req: Request, property: "body" | "params" | "query", value: unknown) {
  Object.defineProperty(req, property, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  const body = sanitizeObject(req.body);
  if (body !== req.body) {
    setRequestProperty(req, "body", body);
  }

  const params = sanitizeObject(req.params);
  if (params !== req.params) {
    setRequestProperty(req, "params", params);
  }

  const query = sanitizeObject(req.query);
  if (query !== req.query) {
    setRequestProperty(req, "query", query);
  }

  next();
}
