import {
  LESSON_TIME_WINDOWS,
  LESSON_TYPES,
} from "../types/domain";
import type { AuthTokenPayload, Lesson, User } from "../types/domain";

type JsonObject = Record<string, unknown>;

export function getRecord(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null ? value as JsonObject : null;
}

export function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  const record = getRecord(error);
  const message = getString(record?.message);
  return message ?? fallback;
}

export async function readJsonObject(response: Response): Promise<JsonObject> {
  const value = await response.json();
  return getRecord(value) ?? {};
}

export function parseJsonObject(text: string): JsonObject | null {
  try {
    return getRecord(JSON.parse(text));
  } catch {
    return null;
  }
}

function isLessonType(value: unknown): value is Lesson["type"] {
  return typeof value === "string" && LESSON_TYPES.some((lessonType) => lessonType === value);
}

function isLessonTimeWindow(value: unknown): value is Lesson["timeLength"] {
  return typeof value === "string" && LESSON_TIME_WINDOWS.some((lessonTimeWindow) => lessonTimeWindow === value);
}

export function isLesson(value: unknown): value is Lesson {
  const record = getRecord(value);

  return typeof record?._id === "string"
    && isLessonType(record.type)
    && typeof record.date === "string"
    && isLessonTimeWindow(record.timeLength)
    && typeof record.guests === "number"
    && (record.assignedTo === null || typeof record.assignedTo === "string");
}

export function isLessonArray(value: unknown): value is Lesson[] {
  return Array.isArray(value) && value.every(isLesson);
}

export function isUser(value: unknown): value is User {
  const record = getRecord(value);

  return typeof record?._id === "string"
    && typeof record.username === "string"
    && (record.admin === undefined || typeof record.admin === "boolean");
}

export function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}

export function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  const record = getRecord(value);

  return !!record
    && (record.exp === undefined || typeof record.exp === "number")
    && (record.admin === undefined || typeof record.admin === "boolean");
}