import * as lib from "../../src/utils/auth-library.js";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";

// Mock localStorage
let store = {};
window.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    store[key] = value;
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};

// Mock fetch per route
window.fetch = vi.fn((url) => {
  if (url === "/api/login") {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ token: "abc123" }),
    });
  } else if (url === "/api/register") {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ username: "newuser" }),
    });
  } else if (url === "/api/logout") {
    return Promise.resolve({ ok: true });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: "Not found" }),
  });
});

describe("login", () => {
  let originalWindow;
  let originalAlert;

  beforeEach(() => {
    originalWindow = window.window;
    window.window = { ...window.window, location: { href: "" } };

    originalAlert = window.alert;
    window.alert = vi.fn();
  });

  afterEach(() => {
    window.window = originalWindow;
    window.alert = originalAlert;
    store = {};
  });

  it("should login successfully, store token, and redirect", async () => {
    await lib.login("test", "test");

    expect(localStorage.getItem("token")).toBe("abc123");
    expect(window.location.href).toBe("/instructor.html");
    expect(alert).not.toHaveBeenCalled();
  });

  it("should alert on failed login", async () => {
    window.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    await lib.login("test", "wrongpass");

    expect(alert).toHaveBeenCalledWith("Invalid credentials");
    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("logout", () => {
  beforeEach(() => {
    store = { token: "abc123" };
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

describe("register", () => {
  let originalAlert;

  beforeEach(() => {
    originalAlert = window.alert;
    window.alert = vi.fn();
  });

  afterEach(() => {
    window.alert = originalAlert;
  });

  it("should alert success message on successful registration", async () => {
    await lib.register("newuser", "pass", false);

    expect(alert).toHaveBeenCalledWith("newuser registered");
  });

  it("should alert error message on failed registration", async () => {
    // Override fetch to simulate failed registration
    window.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Username exists" }),
    });

    await lib.register("newuser", "pass", true);

    expect(alert).toHaveBeenCalledWith("Username exists");
  });

  it("should log errors when fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    window.fetch.mockRejectedValueOnce(new Error("Network error"));

    await lib.register("newuser", "pass", false);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error during login:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe("selfDeleteFrontend", () => {
  beforeEach(() => {
    store = { token: "abc123" };

    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);

    // Reset location.href
    window.location.href = "";

    fetch.mockReset();
  });

  afterEach(() => {
    window.alert = undefined;
    window.confirm = undefined;
  });

  it("should confirm deletion and call API on confirm", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Account deleted successfully" }),
    });

    await lib.selfDeleteFrontend("abc123");

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    expect(fetch).toHaveBeenCalledWith("/api/self-delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer abc123`,
      },
    });

    expect(window.alert).toHaveBeenCalledWith("Account deleted successfully");
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/index.html");
  });
});


