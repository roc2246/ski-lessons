import * as lib from "../auth-library";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";

const fetchMock = vi.fn<typeof fetch>();
const storage = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return storage.size;
  },
  clear() {
    storage.clear();
  },
  getItem(key) {
    return storage.get(key) ?? null;
  },
  key(index) {
    return Array.from(storage.keys())[index] ?? null;
  },
  removeItem(key) {
    storage.delete(key);
  },
  setItem(key, value) {
    storage.set(key, value);
  },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageMock);
  localStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("alert", vi.fn());
  vi.stubGlobal("confirm", vi.fn(() => true));
  vi.stubGlobal("location", { href: "" } as Location);

  fetchMock.mockImplementation(async (input) => {
    const url = String(input);

    if (url === "/api/auth/login") {
      return textResponse(JSON.stringify({ token: "abc123" }));
    }

    if (url === "/api/auth/register") {
      return jsonResponse({ username: "newuser" });
    }

    if (url === "/api/auth/logout") {
      return textResponse("", 200);
    }

    if (url === "/api/users/me") {
      return jsonResponse({ message: "Account deleted successfully" });
    }

    return textResponse(JSON.stringify({ error: "Not found" }), 404);
  });
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ----- LOGIN -----
describe("login", () => {
  it("should login successfully, store token, and redirect", async () => {
    await lib.login("test", "test");

    expect(localStorage.getItem("token")).toBe("abc123");
    expect(globalThis.location.href).toBe("/instructor");
    expect(alert).not.toHaveBeenCalled();
  });

  it("should alert on failed login", async () => {
    fetchMock.mockResolvedValueOnce(textResponse(JSON.stringify({ error: "Invalid credentials" }), 401));

    await lib.login("test", "wrongpass");

    expect(alert).toHaveBeenCalledWith("Invalid credentials");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should return null when login request throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network down"));

    const result = await lib.login("test", "test");

    expect(result).toBeNull();
    expect(alert).toHaveBeenCalledWith("Network down");
  });
});

// ----- LOGOUT -----
describe("logout", () => {
  beforeEach(() => {
    localStorage.setItem("token", "abc123");
  });

  it("should call /api/auth/logout and remove token", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("", 200));

    await lib.logout();

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer abc123",
      },
    });

    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should handle fetch errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    await lib.logout();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Logout request failed:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

// ----- REGISTER -----
describe("register", () => {
  it("should alert success message on successful registration", async () => {
    await lib.register("newuser", "pass", false);
    expect(alert).toHaveBeenCalledWith("newuser registered");
  });

  it("should alert error message on failed registration", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Username exists" }, 400));

    await lib.register("newuser", "pass", true);
    expect(alert).toHaveBeenCalledWith("Username exists");
  });

  it("should log errors when fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    await lib.register("newuser", "pass", false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error during login:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

// ----- SELF DELETE -----
describe("selfDeleteFrontend", () => {
  beforeEach(() => {
    localStorage.setItem("token", "abc123");
  });

  it("should confirm deletion and call API on confirm", async () => {
    await lib.selfDeleteFrontend();

    expect(globalThis.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/users/me", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer abc123",
      },
    });

    expect(alert).toHaveBeenCalledWith("Account deleted successfully");
    expect(localStorage.getItem("token")).toBeNull();
    expect(globalThis.location.href).toBe("/");
  });
});
