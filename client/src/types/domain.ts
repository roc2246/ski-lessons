export const LESSON_TYPES = ["beginner", "intermediate", "advanced", "expert"] as const;
export const LESSON_TIME_WINDOWS = ["9-12", "1-4", "9-4"] as const;
export const UNASSIGNED_LESSON_VALUE = "None" as const;

export type LessonType = typeof LESSON_TYPES[number];
export type LessonTimeWindow = typeof LESSON_TIME_WINDOWS[number];
export type LessonAssignmentInput = string | typeof UNASSIGNED_LESSON_VALUE | null;

export interface Lesson {
  _id: string;
  type: LessonType;
  date: string;
  timeLength: LessonTimeWindow;
  guests: number;
  assignedTo: string | null;
}

export interface CalendarLesson extends Lesson {
  _year: number;
  _month: number;
  _day: number;
  _startDate: Date;
}

export interface User {
  _id: string;
  username: string;
  admin?: boolean;
}

export interface Credentials {
  userId: string;
  username: string;
  admin: boolean;
}

export interface AuthTokenPayload {
  exp?: number;
  admin?: boolean;
}

export interface AuthState {
  token: string | null;
  admin: boolean;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export interface LessonMutationInput {
  type: LessonType;
  date: string;
  timeLength: LessonTimeWindow;
  guests: number;
  assignedTo: LessonAssignmentInput;
}
