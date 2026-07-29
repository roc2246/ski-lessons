import type { ApiErrorResponse } from "../types/domain";

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
    const data = (text ? JSON.parse(text) : null) as LoginResponse | null;

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
  } catch (error) {
    console.error("Error during login:", error);
    const err = error as Error;
    alert(err.message || "Something went wrong during login");
    return null;
  }
}


// --------------------- LOGOUT ---------------------
export async function logout() {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (err) {
    console.error("Logout request failed:", err);
  } finally {
    // ALWAYS remove token locally
    localStorage.removeItem("token");
  }
}


// --------------------- REGISTER ---------------------
export async function register(username: string, password: string, admin: boolean) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, admin }),
    });

    const data = (await res.json()) as ApiErrorResponse;

    if (res.ok) {
      alert(`${username} registered`);
    } else {
      alert(data.error || "Registration failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

// --------------------- SELF DELETE ---------------------
export async function selfDeleteFrontend() {
  const token = localStorage.getItem("token")
  if (
    !globalThis.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem("token");
      alert(data.message || "Account deleted successfully"); // matches test
      globalThis.location.href = "/";
    } else {
      alert(data.message || "Failed to delete account");
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    alert("An unexpected error occurred. Please try again");
  }
}
