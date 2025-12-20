import {
  describe,
  it,
  vi,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import * as lib from "../admin-library.js";

let originalFetch;

beforeAll(() => {
  // Save original fetch (Node 18+ or browser)
  originalFetch = globalThis.fetch;

  // Stub global fetch
  vi.stubGlobal("fetch", vi.fn());
});

afterAll(() => {
  // Restore original fetch
  vi.stubGlobal("fetch", originalFetch);
});

beforeEach(() => {
  // Reset fetch call history before each test
  globalThis.fetch.mockReset();
});


// =====================
// isAdmin
// =====================
describe("isAdmin", () => {
  it("should call fetch with correct arguments", async () => {
    const fakeToken = "fakeToken123";

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        credentials: { admin: true },
      }),
    });

    const result = await lib.isAdmin(fakeToken);

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/is-admin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fakeToken}`,
      },
    });

    expect(result).toBe(true);
  });

  it("should return false if admin is false", async () => {
    const fakeToken = "fakeToken456";

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        credentials: { admin: false },
      }),
    });

    const result = await lib.isAdmin(fakeToken);
    expect(result).toBe(false);
  });

  it("should throw an error if fetch returns non-ok", async () => {
    const fakeToken = "fakeToken789";

    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        message: "Unauthorized access",
      }),
    });

    await expect(lib.isAdmin(fakeToken)).rejects.toThrow(
      "Unauthorized access"
    );
  });

  it("should throw an error if fetch rejects (network error)", async () => {
    const error = new Error("Network failure");

    globalThis.fetch.mockRejectedValue(error);

    await expect(lib.isAdmin("fakeToken")).rejects.toThrow(
      "Network failure"
    );
  });

  it("should throw an error if token is missing", async () => {
    await expect(lib.isAdmin(undefined)).rejects.toThrow(
      "No auth token provided"
    );
    await expect(lib.isAdmin(null)).rejects.toThrow(
      "No auth token provided"
    );
  });

  it("should log an error on fetch failure", async () => {
    const error = new Error("Network failure");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    globalThis.fetch.mockRejectedValue(error);

    await expect(lib.isAdmin("fakeToken")).rejects.toThrow(
      "Network failure"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking admin status:",
      error
    );

    consoleSpy.mockRestore();
  });
});


// =====================
// lessonCreate
// =====================
describe("lessonCreate", () => {
  it("should call fetch with correct arguments", async () => {
    const lessonData = { type: "Beginner Snowboarding", date: "2025-12-20" };

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        lesson: { ...lessonData, assignedTo: "user123" },
      }),
    });

    const result = await lib.lessonCreate(lessonData, "any-token");

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/create-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lessonData }),
    });

    expect(result).toEqual({ ...lessonData, assignedTo: "user123" });
  });

  it("should throw an error if fetch returns non-ok", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Failed to create lesson" }),
    });

    await expect(lib.lessonCreate({ type: "Intermediate" }, "any-token")).rejects.toThrow(
      "Failed to create lesson"
    );
  });

  it("should throw on network failure", async () => {
    const error = new Error("Network failure");
    globalThis.fetch.mockRejectedValue(error);

    await expect(lib.lessonCreate({ type: "Advanced" }, "any-token")).rejects.toThrow(
      "Network failure"
    );
  });

  it("should log error on fetch failure", async () => {
    const error = new Error("Network failure");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    globalThis.fetch.mockRejectedValue(error);

    await expect(lib.lessonCreate({ type: "Freestyle" }, "any-token")).rejects.toThrow(
      "Network failure"
    );

    expect(consoleSpy).toHaveBeenCalledWith("Error during lesson creation:", error);

    consoleSpy.mockRestore();
  });
});


// =====================
// getUsers
// =====================
describe("getUsers", () => {
  it("should call fetch with correct arguments", async () => {
    const users = [{ name: "John" }, { name: "Sarah" }];

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: "Users retrieved",
        users,
      }),
    });

    const result = await lib.getUsers();

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/user-retrieval", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(result).toEqual(users);
  });

  it("should throw if users field is missing", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: "Users retrieved",
      }),
    });

    await expect(lib.getUsers()).rejects.toThrow(
      "Malformed response: missing users field"
    );
  });

  it("should throw on fetch failure", async () => {
    const error = new Error("Network failure");
    globalThis.fetch.mockRejectedValue(error);

    await expect(lib.getUsers()).rejects.toThrow("Network failure");
  });

  it("should log error on fetch rejection", async () => {
    const error = new Error("Network failure");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    globalThis.fetch.mockRejectedValue(error);

    await expect(lib.getUsers()).rejects.toThrow("Network failure");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving users:",
      error
    );

    consoleSpy.mockRestore();
  });

  it("should return users exactly as provided", async () => {
    const users = [
      { id: 1, name: "Test A" },
      { id: 2, name: "Test B" },
    ];

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: "Users retrieved",
        users,
      }),
    });

    const result = await lib.getUsers();
    expect(result).toEqual(users);
  });
});
