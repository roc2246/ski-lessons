import type {
  ApiErrorResponse,
  AuthState,
  AuthTokenPayload,
  Lesson,
  LessonMutationInput,
  User,
} from "../types/domain";
import { getRequiredAuthToken } from "./token-library";

function decodeTokenPayload(token: string): AuthTokenPayload | null {
  try {
    const payload = token?.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(globalThis.atob(padded));
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

    const data = (await res.json()) as { message?: string; credentials?: { admin?: boolean } };

    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve admin status");
    }

    return data.credentials?.admin === true;
  } catch (error) {
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

    const data = (await res.json()) as { message?: string; users?: User[] };

    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve users");
    }

    if (!data || !Array.isArray(data.users)) {
      throw new Error("Malformed response: missing users field");
    }

    return data.users;
  } catch (error) {
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

    const data = (await res.json()) as { message?: string; user?: User };

    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve user");
    }

    if (!data || !data.user) {
      throw new Error("Malformed response: missing user field");
    }

    return data.user;
  } catch (error) {
    console.error("Error retrieving user:", error);
    throw error;
  }
}

export async function lessonCreate(newLesson: LessonMutationInput): Promise<Lesson> {
  const token = getRequiredAuthToken();

  try {
    const lessonData = {
      ...newLesson,
      assignedTo:
        newLesson.assignedTo === "None" || newLesson.assignedTo === ""
          ? null
          : newLesson.assignedTo,
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

    const data = (await res.json()) as { lesson?: Lesson; message?: string };

    if (res.ok) {
      if (!data.lesson) {
        throw new Error("Malformed response: missing lesson field");
      }
      console.log("Lesson created successfully:", data.lesson);
      return data.lesson;
    } else {
      console.error("Lesson creation failed:", data);
      throw new Error(data.message || "Failed to create lesson");
    }
  } catch (error) {
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

    const data = (await res.json()) as { success?: boolean; message?: string; lesson?: Lesson };

    if (res.ok) {
      console.log("Lesson deleted successfully:", data);
      return data;
    } else {
      console.error("Lesson deletion failed:", data);
      throw new Error(data.message || "Failed to delete lesson");
    }
  } catch (error) {
    console.error("Error during lesson deletion:", error);
    throw error;
  }
}

export async function lessonUpdate(lessonId: string, updatedLesson: LessonMutationInput): Promise<Lesson> {
  const token = getRequiredAuthToken();

  try {
    const lessonData = {
      ...updatedLesson,
      assignedTo:
        updatedLesson.assignedTo === "None" || updatedLesson.assignedTo === ""
          ? null
          : updatedLesson.assignedTo,
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

    const data = (await res.json()) as { lesson?: Lesson; message?: string };

    if (res.ok) {
      return data.lesson as Lesson;
    }

    throw new Error(data.message || "Failed to update lesson");
  } catch (error) {
    console.error("Error during lesson update:", error);
    throw error;
  }
}