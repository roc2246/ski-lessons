export interface Lesson {
  _id: string;
  type: string;
  date: string;
  timeLength: string;
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
  type: string;
  date: string;
  timeLength: string;
  guests: number;
  assignedTo: string | "None" | null;
}
