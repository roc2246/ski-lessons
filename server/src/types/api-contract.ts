/**
 * API Contract Types
 * 
 * These types define the shape of data returned by the server API.
 * They must stay synchronized with client expectations in client/src/types/domain.ts.
 * 
 * This is the single source of truth for API request/response shapes.
 */

export const LESSON_TYPES = ["beginner", "intermediate", "advanced", "expert"] as const;
export const LESSON_TIME_WINDOWS = ["9-12", "1-4", "9-4"] as const;

export type LessonType = typeof LESSON_TYPES[number];
export type LessonTimeWindow = typeof LESSON_TIME_WINDOWS[number];

/**
 * Lesson as returned by the API (without Mongoose internals)
 */
export interface ApiLesson {
  _id: string;
  type: LessonType;
  date: string;
  timeLength: LessonTimeWindow;
  guests: number;
  assignedTo: string | null;
}

/**
 * User as returned by the API (password excluded)
 */
export interface ApiUser {
  _id: string;
  username: string;
  admin?: boolean;
}

/**
 * Credentials returned during authentication
 */
export interface ApiCredentials {
  userId: string;
  username: string;
  admin: boolean;
}

/**
 * JWT token payload structure
 */
export interface ApiAuthTokenPayload {
  exp?: number;
  userId?: string;
  username?: string;
  admin?: boolean;
}

/**
 * Error response shape
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  success?: boolean;
  lesson?: ApiLesson;
}
