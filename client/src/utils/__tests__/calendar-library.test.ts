import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as lib from "../calendar-library";
import type { Lesson } from "../../types/domain";

const fetchMock = vi.fn<typeof fetch>();
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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

// ========================
// Global Mocks
// ========================
beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("localStorage", localStorageMock);
});

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  consoleErrorSpy.mockReset();
});

// ========================
// getLessons
// ========================
describe("getLessons", () => {
  it("fetches lessons successfully", async () => {
    localStorage.setItem("token", "token123");
    const mockLessons: Lesson[] = [{ _id: "1", type: "beginner", date: "2025-10-25", timeLength: "9-12", guests: 2, assignedTo: null }];
    fetchMock.mockResolvedValue(jsonResponse({ lessons: mockLessons }));

    const lessons = await lib.getLessons("true");
    expect(lessons).toEqual(mockLessons);
    expect(fetchMock).toHaveBeenCalledWith("/api/lessons?assignedTo=true", {
      headers: { Authorization: "Bearer token123" },
    });
  });

  it("throws error when response not ok", async () => {
    localStorage.setItem("token", "token123");
    fetchMock.mockResolvedValue(jsonResponse({ message: "fail" }, 400));

    await expect(lib.getLessons("true")).rejects.toThrow("fail");
    expect(console.error).toHaveBeenCalled();
  });
});

// ========================
// preprocessLessons
// ========================
describe("preprocessLessons", () => {
  it("adds _year, _month, _day, _startDate", () => {
    const lessons: Lesson[] = [{ _id: "1", type: "beginner", date: "2025-10-25", timeLength: "9-12", guests: 1, assignedTo: null }];
    const processed = lib.preprocessLessons(lessons);
    expect(processed[0]._year).toBe(2025);
    expect(processed[0]._month).toBe(10);
    expect(processed[0]._day).toBe(25);
    expect(processed[0]._startDate instanceof Date).toBe(true);
    expect(processed[0]._startDate.getHours()).toBe(9);
    expect(processed[0]._startDate.getMinutes()).toBe(0);
  });

  it("handles time without colon", () => {
    const lessons: Lesson[] = [{ _id: "1", type: "beginner", date: "2025-10-25", timeLength: "9-12", guests: 1, assignedTo: null }];
    const processed = lib.preprocessLessons(lessons);
    expect(processed[0]._startDate.getHours()).toBe(9);
    expect(processed[0]._startDate.getMinutes()).toBe(0);
  });
});

// ========================
// getMonthYear
// ========================
describe("getMonthYear", () => {
  it("returns correct string", () => {
    const date = new Date(2025, 9, 15); // October 15, 2025
    const result = lib.getMonthYear(date);
    expect(result).toBe("October 2025");
  });
});

// ========================
// getDatesForMonth
// ========================
describe("getDatesForMonth", () => {
  it("returns correct array of days", () => {
    const date = new Date(2025, 9, 1); // October
    const result = lib.getDatesForMonth(date);
    expect(result[0]).toBe(1);
    expect(result.length).toBe(31);
    expect(result[result.length - 1]).toBe(31);
  });
});

// ========================
// generateCalendarDates
// ========================
describe("generateCalendarDates", () => {
  it("returns array of Date objects", () => {
    const date = new Date(2025, 9, 1); // October
    const result = lib.generateCalendarDates(date);
    expect(result.length).toBe(31);
    expect(result[0]).toBeInstanceOf(Date);
    expect(result[0].getDate()).toBe(1);
    expect(result[result.length - 1].getDate()).toBe(31);
  });
});

// ========================
// prevMonth / nextMonth
// ========================
describe("prevMonth & nextMonth", () => {
  it("prevMonth works correctly", () => {
    const { newMonthYear, newDates } = lib.prevMonth("January 2025");
    expect(newMonthYear).toBe("December 2024");
    expect(newDates[0]).toBe(1);
    expect(newDates.length).toBe(31);
  });

  it("nextMonth works correctly", () => {
    const { newMonthYear, newDates } = lib.nextMonth("December 2025");
    expect(newMonthYear).toBe("January 2026");
    expect(newDates[0]).toBe(1);
    expect(newDates.length).toBe(31);
  });
});

// ========================
// getLessonsForMonth
// ========================
describe("getLessonsForMonth", () => {
  it("filters lessons correctly for the month", async () => {
    const date = new Date(2025, 9, 1); // October
    const lessons: Lesson[] = [
      { _id: "1", type: "beginner", date: "2025-10-02", timeLength: "9-12", guests: 2, assignedTo: null },
      { _id: "2", type: "advanced", date: "2025-11-03", timeLength: "1-4", guests: 1, assignedTo: null },
    ];
    fetchMock.mockResolvedValue(jsonResponse({ lessons }));

    const result = await lib.getLessonsForMonth(date, "token123");
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-10-02");
  });

  it("returns empty array on fetch failure", async () => {
    fetchMock.mockRejectedValue(new Error("fail"));
    const result = await lib.getLessonsForMonth(new Date(), "token123");
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
