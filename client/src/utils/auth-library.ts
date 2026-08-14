import type { ApiErrorResponse } from "../types/domain";
import { getRequiredAuthToken } from "./token-library";
import { getErrorMessage, getString, parseJsonObject, readJsonObject } from "./response-guards";

interface LoginResponse {
  token?: string;
  message?: string;
  error?: string;
}

// --------------------- LOGIN ---------------------
export async function login(username: string, password: string): Promise<LoginResponse | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const text = await res.text();
    const dataObject = text ? parseJsonObject(text) : null;
    const data: LoginResponse | null = dataObject
      ? {
          token: getString(dataObject.token),
          message: getString(dataObject.message),
          error: getString(dataObject.error),
        }
      : null;

    if (!res.ok) {
      alert(data?.error || "Login failed"); // match test
      return null;
    }

    if (data?.token) {
      localStorage.setItem("token", data.token);
      if (typeof globalThis !== "undefined" && globalThis.location) {
        globalThis.location.href = "/instructor";
      }
    }

    return data;
  } catch (error: unknown) {
    console.error("Error during login:", error);
    alert(getErrorMessage(error, "Something went wrong during login"));
    return null;
  }
}


// --------------------- LOGOUT ---------------------
export async function logout(): Promise<void> {
  try {
    const token = getRequiredAuthToken();
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err: unknown) {
    console.error("Logout request failed:", err);
  } finally {
    // ALWAYS remove token locally
    localStorage.removeItem("token");
  }
}


// --------------------- REGISTER ---------------------
export async function register(username: string, password: string, admin: boolean): Promise<void> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, admin }),
    });

    const data = await readJsonObject(res) as ApiErrorResponse;

    if (res.ok) {
      alert(`${username} registered`);
    } else {
      alert(data.error || "Registration failed");
    }
  } catch (error: unknown) {
    console.error("Error during login:", error);
  }
}

// --------------------- SELF DELETE ---------------------
export async function selfDeleteFrontend(): Promise<void> {
  if (
    !globalThis.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const token = getRequiredAuthToken();
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readJsonObject(res);

    if (res.ok) {
      localStorage.removeItem("token");
      alert(getString(data.message) ?? "Account deleted successfully");
      globalThis.location.href = "/";
    } else {
      alert(getString(data.message) ?? "Failed to delete account");
    }
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    alert("An unexpected error occurred. Please try again");
  }
}
