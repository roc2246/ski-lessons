import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as lib from "./calander-library.js";

beforeAll(() => {
  global.localStorage = {
    store: {},
    getItem(key) {
      return this.store[key] || null;
    },
    setItem(key, value) {
      this.store[key] = value;
    },
    clear() {
      this.store = {};
    },
    removeItem(key) {
      delete this.store[key];
    },
  };
});

// ========================
// getLessons
// ========================
describe("getLessons", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("fetches lessons successfully", async () => {
    localStorage.setItem("token", "fake-token");
    const mockResponse = { lessons: [{ date: "2025-10-25", timeLength: "10:00-11:00" }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const lessons = await lib.getLessons();
    expect(lessons).toEqual(mockResponse.lessons);
    expect(global.fetch).toHaveBeenCalledWith("/api/lessons", {
      headers: { Authorization: "Bearer fake-token" },
    });
  });

  it("throws error on fetch failure", async () => {
    localStorage.setItem("token", "fake-token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "error" }),
    });

    await expect(lib.getLessons()).rejects.toThrow("error");
  });
});

// ========================
// preprocessLessons
// ========================
describe("preprocessLessons", () => {
  it("adds _year, _month, _day, _startDate", () => {
    const lessons = [{ date: "2025-10-25", timeLength: "09:30-10:30" }];
    const result = lib.preprocessLessons(lessons);

    expect(result[0]._year).toBe(2025);
    expect(result[0]._month).toBe(10);
    expect(result[0]._day).toBe(25);
    expect(result[0]._startDate instanceof Date).toBe(true);
  });

  it("handles time without colon correctly", () => {
    const lessons = [{ date: "2025-10-25", timeLength: "9-10:30" }];
    const result = lib.preprocessLessons(lessons);
    expect(result[0]._startDate.getHours()).toBe(9);
    expect(result[0]._startDate.getMinutes()).toBe(0);
  });
});

// ========================
// assignLesson
// ========================
describe("assignLesson", () => {
  it("calls fetch with correct URL and headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ lesson: { id: "1" } }),
    });
    global.fetch = mockFetch;

    const lesson = await lib.assignLesson("1", "token123");
    expect(lesson.id).toBe("1");
    expect(mockFetch).toHaveBeenCalledWith("/api/lessons/1/assign", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token123",
      },
    });
  });

  it("throws an error if response not ok", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "fail" }),
    });
    global.fetch = mockFetch;

    await expect(lib.assignLesson("1", "token123")).rejects.toThrow("fail");
  });
});
