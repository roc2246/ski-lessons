import type { NextFunction, Request, Response } from "express";
import * as utilities from "../utilities/index.js";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const LESSON_TYPES = ["beginner", "intermediate", "advanced", "expert"] as const;
const LESSON_WINDOWS = ["9-12", "1-4", "9-4"] as const;

type LessonType = typeof LESSON_TYPES[number];
type LessonWindow = typeof LESSON_WINDOWS[number];

const LESSON_TYPE_SET = new Set<string>(LESSON_TYPES);
const LESSON_WINDOW_SET = new Set<string>(LESSON_WINDOWS);

function ensureString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

interface LessonPayload {
  type?: LessonType | unknown;
  timeLength?: LessonWindow | unknown;
  date?: unknown;
  guests?: unknown;
  assignedTo?: unknown;
  [key: string]: unknown;
}

interface ValidationRequest {
  body?: {
    username?: unknown;
    password?: unknown;
    admin?: boolean;
    lessonData?: LessonPayload;
  };
  params?: {
    lessonId?: unknown;
  };
}

export function validateRegisterRequest(req: Request, res: Response, next: NextFunction) {
  const validationReq = req as ValidationRequest;
  const username = ensureString(validationReq.body?.username);
  const password = ensureString(validationReq.body?.password);

  if (!username || username.length < 3) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Username must be at least 3 characters"));
  }

  if (!password || password.length < 6) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Password must be at least 6 characters"));
  }

  if (validationReq.body) {
    validationReq.body.username = username;
    validationReq.body.password = password;
    validationReq.body.admin = false;
  }
  next();
}

export function validateLoginRequest(req: Request, res: Response, next: NextFunction) {
  const validationReq = req as ValidationRequest;
  const username = ensureString(validationReq.body?.username);
  const password = ensureString(validationReq.body?.password);

  if (!username || !password) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Username and password are required"));
  }

  if (validationReq.body) {
    validationReq.body.username = username;
    validationReq.body.password = password;
  }
  next();
}

export function validateCreateLessonRequest(req: Request, res: Response, next: NextFunction) {
  const validationReq = req as ValidationRequest;
  const lessonData = validationReq.body?.lessonData;
  if (!lessonData || typeof lessonData !== "object") {
    return utilities.sendError(res, 400, "Validation failed", new Error("lessonData is required"));
  }

  const type = ensureString(lessonData.type);
  const timeLength = ensureString(lessonData.timeLength);
  const date = ensureString(lessonData.date);
  const guests = Number(lessonData.guests);
  const assignedTo = lessonData.assignedTo;

  if (!LESSON_TYPE_SET.has(type)) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lesson type"));
  }

  if (!LESSON_WINDOW_SET.has(timeLength)) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lesson timeLength"));
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lesson date"));
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Guests must be an integer from 1 to 12"));
  }

  const assignedToValid = assignedTo === null || assignedTo === undefined || assignedTo === "" || (typeof assignedTo === "string" && OBJECT_ID_REGEX.test(assignedTo));

  if (!assignedToValid) {
    return utilities.sendError(res, 400, "Validation failed", new Error("assignedTo must be null or a valid user id"));
  }

  const normalizedAssignedTo = assignedTo === undefined || assignedTo === "" ? null : assignedTo;

  if (validationReq.body) {
    validationReq.body.lessonData = {
      ...lessonData,
      type,
      timeLength,
      date,
      guests,
      assignedTo: normalizedAssignedTo,
    };
  }

  next();
}

export function validateUpdateLessonRequest(req: Request, res: Response, next: NextFunction) {
  return validateCreateLessonRequest(req, res, next);
}

export function validateAssignLessonRequest(req: Request, res: Response, next: NextFunction) {
  const validationReq = req as ValidationRequest;
  const lessonId = ensureString(validationReq.params?.lessonId);

  if (!OBJECT_ID_REGEX.test(lessonId)) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lessonId"));
  }

  if (validationReq.params) {
    validationReq.params.lessonId = lessonId;
  }
  next();
}
