import { describe, it, vi, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import * as lib from "./admin-library.js";

let originalFetch;

beforeAll(() => {
  // Save original fetch
  originalFetch = global.fetch;

  // Mock globally for all tests
  global.fetch = vi.fn();
});

afterAll(() => {
  // Restore original fetch after all tests
  global.fetch = originalFetch;
});

beforeEach(() => {
  // Reset call history before each test
  global.fetch.mockReset();
});

describe("lessonCreate", () => {
  it("should call fetch with correct arguments", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Beginner Snowboarding", date: "2025-12-20" };

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ lesson: { ...newLesson, assignedTo: "user123" } }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await lib.lessonCreate(newLesson, fakeToken);

    expect(global.fetch).toHaveBeenCalledWith("/api/create-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fakeToken}`,
      },
      body: JSON.stringify({ lessonData: newLesson }),
    });

    expect(result).toEqual({ ...newLesson, assignedTo: "user123" });
  });

  it("should throw an error if fetch returns non-ok", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Intermediate Snowboarding" };

    global.fetch.mockResolvedValue({
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

    global.fetch.mockRejectedValue(networkError);

    await expect(lib.lessonCreate(newLesson, fakeToken)).rejects.toThrow(
      "Network failure"
    );
  });

  it("should throw an error if token is missing", async () => {
    const newLesson = { type: "Beginner Snowboarding" };

    await expect(lib.lessonCreate(newLesson, undefined)).rejects.toThrow(
      "No auth token provided"
    );
    await expect(lib.lessonCreate(newLesson, null)).rejects.toThrow(
      "No auth token provided"
    );
  });

  it("should call console.error on fetch failure", async () => {
    const fakeToken = "fakeToken123";
    const newLesson = { type: "Freestyle Snowboarding" };
    const networkError = new Error("Network failure");

    global.fetch.mockRejectedValue(networkError);
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
