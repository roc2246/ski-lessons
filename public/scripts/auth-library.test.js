import * as lib from "./auth-library.js";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";

// Mock localStorage
let store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

// Mock fetch per route
global.fetch = vi.fn((url) => {
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
    // Mock window.location.href
    originalWindow = global.window;
    global.window = { ...global.window, location: { href: "" } };

    // Mock alert
    originalAlert = global.alert;
    global.alert = vi.fn();
  });

  afterEach(() => {
    global.window = originalWindow;
    global.alert = originalAlert;
    store = {}; // reset localStorage mock
  });

  it("should login successfully, store token, and redirect", async () => {
    await lib.login("test", "test");

    // Assert token is stored
    expect(localStorage.getItem("token")).toBe("abc123");

    // Assert redirect
    expect(window.location.href).toBe("/instructor.html");

    // Alert should not have been called
    expect(alert).not.toHaveBeenCalled();
  });

  it("should alert on failed login", async () => {
    // Override fetch to simulate failed login
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    await lib.login("test", "wrongpass");

    expect(alert).toHaveBeenCalledWith("Invalid credentials");
    expect(localStorage.getItem("token")).toBeNull();
  });
});
