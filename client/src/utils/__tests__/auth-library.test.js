import * as lib from "../auth-library.js";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";

let store = {};

// ----- Mock localStorage -----
beforeEach(() => {
  store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  // Mock location
  globalThis.location = { href: "" };

  // Mock alert/confirm
  globalThis.alert = vi.fn();
  globalThis.confirm = vi.fn(() => true);

  // Mock fetch
  globalThis.fetch = vi.fn((url) => {
    if (url === "/api/login") {
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify({ token: "abc123" }),
      });
    } else if (url === "/api/register") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ username: "newuser" }),
      });
    } else if (url === "/api/logout") {
      return Promise.resolve({ ok: true });
    } else if (url === "/api/self-delete") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ message: "Account deleted successfully" }),
      });
    }
    return Promise.resolve({
      ok: false,
      text: async () => JSON.stringify({ error: "Not found" }),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  store = {};
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
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ error: "Invalid credentials" }),
    });

    await lib.login("test", "wrongpass");

    expect(alert).toHaveBeenCalledWith("Invalid credentials");
    expect(localStorage.getItem("token")).toBeNull();
  });
});

// ----- LOGOUT -----
describe("logout", () => {
  beforeEach(() => {
    localStorage.setItem("token", "abc123");
  });

  it("should call /api/logout and remove token", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    await lib.logout("abc123");

    expect(fetch).toHaveBeenCalledWith("/api/logout", {
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
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await lib.logout("abc123");

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
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Username exists" }),
    });

    await lib.register("newuser", "pass", true);
    expect(alert).toHaveBeenCalledWith("Username exists");
  });

  it("should log errors when fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("Network error"));

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
    await lib.selfDeleteFrontend("abc123");

    expect(globalThis.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    expect(fetch).toHaveBeenCalledWith("/api/self-delete", {
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
