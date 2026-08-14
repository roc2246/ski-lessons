import type {
  ApiErrorResponse,
  AuthState,
  AuthTokenPayload,
  Lesson,
  LessonMutationInput,
  User,
} from "../types/domain";
import { getRequiredAuthToken } from "./token-library";
import {
  getBoolean,
  getErrorMessage,
  getRecord,
  getString,
  isAuthTokenPayload,
  isLesson,
  isUser,
  isUserArray,
  readJsonObject,
} from "./response-guards";

function decodeTokenPayload(token: string): AuthTokenPayload | null {
  try {
    const payload = token?.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const parsed = JSON.parse(globalThis.atob(padded));
    return isAuthTokenPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getStoredAuthState(): AuthState {
  const token = localStorage.getItem("token");

  if (!token) {
    return { token: null, admin: false };
  }

  const payload = decodeTokenPayload(token);

  // Discard expired tokens so the app does not boot into an invalid auth state.
  if (typeof payload?.exp === "number" && payload.exp * 1000 <= Date.now()) {
    localStorage.removeItem("token");
    return { token: null, admin: false };
  }

  return {
    token,
    admin: payload?.admin === true,
  };
}

export async function isAdmin(token: string): Promise<boolean> {
  if (!token) {
    throw new Error("No auth token provided");
  }

  try {
    const res = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readJsonObject(res);
    const credentials = getRecord(data.credentials);

    if (!res.ok) {
      throw new Error(getString(data.message) ?? "Failed to retrieve admin status");
    }

    return getBoolean(credentials?.admin) === true;
  } catch (error: unknown) {
    console.error("Error checking admin status:", error);
    throw error;
  }
}

export async function getUsers(): Promise<User[]> {
  const token = getRequiredAuthToken();

  try {
    const res = await fetch("/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readJsonObject(res);

    if (!res.ok) {
      throw new Error(getString(data.message) ?? "Failed to retrieve users");
    }

    if (!isUserArray(data.users)) {
      throw new Error("Malformed response: missing users field");
    }

    return data.users;
  } catch (error: unknown) {
    console.error("Error retrieving users:", error);
    throw error;
  }
}

export async function getUser(userId: string): Promise<User> {
  const token = getRequiredAuthToken();

  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readJsonObject(res);

    if (!res.ok) {
      throw new Error(getString(data.message) ?? "Failed to retrieve user");
    }

    if (!isUser(data.user)) {
      throw new Error("Malformed response: missing user field");
    }

    return data.user;
  } catch (error: unknown) {
    console.error("Error retrieving user:", error);
    throw error;
  }
}

function normalizeAssignedTo(assignedTo: LessonMutationInput["assignedTo"]): string | null {
  return assignedTo === "None" || assignedTo === "" ? null : assignedTo;
}

export async function lessonCreate(newLesson: LessonMutationInput): Promise<Lesson> {
  const token = getRequiredAuthToken();

  try {
    const lessonData = {
      ...newLesson,
      assignedTo: normalizeAssignedTo(newLesson.assignedTo),
      date: newLesson.date,
    };

    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lessonData }),
    });

    const data = await readJsonObject(res);

    if (res.ok) {
      if (!isLesson(data.lesson)) {
        throw new Error("Malformed response: missing lesson field");
      }
      console.log("Lesson created successfully:", data.lesson);
      return data.lesson;
    } else {
      console.error("Lesson creation failed:", data);
      throw new Error(getString(data.message) ?? "Failed to create lesson");
    }
  } catch (error: unknown) {
    console.error("Error during lesson creation:", error);
    throw error;
  }
}

export async function lessonDelete(lessonId: string): Promise<{ success?: boolean; message?: string; lesson?: Lesson }> {
  const token = getRequiredAuthToken();

  try {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readJsonObject(res);
    const lesson = isLesson(data.lesson) ? data.lesson : undefined;
    const result = {
      success: typeof data.success === "boolean" ? data.success : undefined,
      message: getString(data.message),
      lesson,
    };

    if (res.ok) {
      console.log("Lesson deleted successfully:", result);
      return result;
    } else {
      console.error("Lesson deletion failed:", result);
      throw new Error(result.message ?? "Failed to delete lesson");
    }
  } catch (error: unknown) {
    console.error("Error during lesson deletion:", error);
    throw error;
  }
}

export async function lessonUpdate(lessonId: string, updatedLesson: LessonMutationInput): Promise<Lesson> {
  const token = getRequiredAuthToken();

  try {
    const lessonData = {
      ...updatedLesson,
      assignedTo: normalizeAssignedTo(updatedLesson.assignedTo),
      date: updatedLesson.date,
    };

    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lessonData }),
    });

    const data = await readJsonObject(res);

    if (res.ok) {
      if (!isLesson(data.lesson)) {
        throw new Error("Malformed response: missing lesson field");
      }

      return data.lesson;
    }

    throw new Error(getString(data.message) ?? "Failed to update lesson");
  } catch (error: unknown) {
    console.error("Error during lesson update:", error);
    throw error;
  }
}