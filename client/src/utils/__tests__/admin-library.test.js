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
  // Save original fetch
  originalFetch = window.fetch;

  // Mock windowly for all tests
  window.fetch = vi.fn();
});

afterAll(() => {
  // Restore original fetch after all tests
  window.fetch = originalFetch;
});

beforeEach(() => {
  // Reset call history before each test
  window.fetch.mockReset();
});

describe("isAdmin", () => {
  it("should call fetch with correct arguments", async () => {
    const fakeToken = "fakeToken123";

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ credentials: { admin: true } }),
    };
    window.fetch.mockResolvedValue(mockResponse);

    const result = await lib.isAdmin(fakeToken);

    expect(window.fetch).toHaveBeenCalledWith("/api/is-admin", {
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

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ credentials: { admin: false } }),
    };
    window.fetch.mockResolvedValue(mockResponse);

    const result = await lib.isAdmin(fakeToken);
    expect(result).toBe(false);
  });

  it("should throw an error if fetch returns non-ok", async () => {
    const fakeToken = "fakeToken789";

    window.fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Unauthorized access" }),
    });

    await expect(lib.isAdmin(fakeToken)).rejects.toThrow("Unauthorized access");
  });

  it("should throw an error if fetch rejects (network error)", async () => {
    const fakeToken = "fakeToken999";
    const networkError = new Error("Network failure");

    window.fetch.mockRejectedValue(networkError);

    await expect(lib.isAdmin(fakeToken)).rejects.toThrow("Network failure");
  });

  it("should throw an error if token is missing", async () => {
    await expect(lib.isAdmin(undefined)).rejects.toThrow(
      "No auth token provided"
    );
    await expect(lib.isAdmin(null)).rejects.toThrow("No auth token provided");
  });

  it("should call console.error on fetch failure", async () => {
    const fakeToken = "fakeToken321";
    const networkError = new Error("Network failure");

    window.fetch.mockRejectedValue(networkError);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(lib.isAdmin(fakeToken)).rejects.toThrow("Network failure");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking admin status:",
      networkError
    );

    consoleSpy.mockRestore();
  });
});

describe("lessonCreate", () => {
  it("should call fetch with correct arguments", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Beginner Snowboarding", date: "2025-12-20" };

    const mockResponse = {
      ok: true,
      json: vi
        .fn()
        .mockResolvedValue({ lesson: { ...newLesson, assignedTo: "user123" } }),
    };
    window.fetch.mockResolvedValue(mockResponse);

    const result = await lib.lessonCreate(newLesson, fakeToken);

    expect(window.fetch).toHaveBeenCalledWith("/api/create-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lessonData: newLesson }),
    });

    expect(result).toEqual({ ...newLesson, assignedTo: "user123" });
  });

  it("should throw an error if fetch returns non-ok", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Intermediate Snowboarding" };

    window.fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Failed to create lesson" }),
    });

    await expect(lib.lessonCreate(newLesson, fakeToken)).rejects.toThrow(
      "Failed to create lesson"
    );
  });

  it("should throw an error if fetch rejects (network error)", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Advanced Snowboarding" };
    const networkError = new Error("Network failure");

    window.fetch.mockRejectedValue(networkError);

    await expect(lib.lessonCreate(newLesson, fakeToken)).rejects.toThrow(
      "Network failure"
    );
  });

  it("should call console.error on fetch failure", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Freestyle Snowboarding" };
    const networkError = new Error("Network failure");

    window.fetch.mockRejectedValue(networkError);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(lib.lessonCreate(newLesson, fakeToken)).rejects.toThrow(
      "Network failure"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error during lesson creation:",
      networkError
    );

    consoleSpy.mockRestore();
  });
});

describe("getUsers", () => {
  it("should call fetch with correct arguments", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: "Users retrieved",
        users: [{ name: "John" }, { name: "Sarah" }],
      }),
    };

    window.fetch.mockResolvedValue(mockResponse);

    const result = await lib.getUsers();

    expect(window.fetch).toHaveBeenCalledWith("/api/user-retrieval", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(result).toEqual([{ name: "John" }, { name: "Sarah" }]);
  });

  it("should throw an error if fetch returns non-ok", async () => {
    window.fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Failed to retrieve users" }),
    });

    await expect(lib.getUsers()).rejects.toThrow("Failed to retrieve users");
  });

  it("should throw an error if the users field is missing", async () => {
    window.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: "Users retrieved" }),
    });

    await expect(lib.getUsers()).rejects.toThrow(
      "Malformed response: missing users field"
    );
  });

  it("should throw an error for malformed JSON structure", async () => {
    window.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ somethingElse: 123 }),
    });

    await expect(lib.getUsers()).rejects.toThrow(
      "Malformed response: missing users field"
    );
  });

  it("should throw on network failure", async () => {
    const networkError = new Error("Network failure");

    window.fetch.mockRejectedValue(networkError);

    await expect(lib.getUsers()).rejects.toThrow("Network failure");
  });

  it("should log an error to console when fetch rejects", async () => {
    const networkError = new Error("Network failure");

    window.fetch.mockRejectedValue(networkError);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(lib.getUsers()).rejects.toThrow("Network failure");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving users:",
      networkError
    );

    consoleSpy.mockRestore();
  });

  it("should return the users array exactly as provided by backend", async () => {
    const fakeUsers = [
      { id: 1, name: "Test A" },
      { id: 2, name: "Test B" },
    ];

    window.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: "Users retrieved", users: fakeUsers }),
    });

    const result = await lib.getUsers();
    expect(result).toEqual(fakeUsers);
  });
});