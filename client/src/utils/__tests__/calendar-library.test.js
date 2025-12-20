import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as lib from "../calendar-library.js";

// ========================
// Global Mocks
// ========================
beforeAll(() => {
  // LocalStorage mock
  globalThis.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value; },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; },
  };

  // Fetch / console mocks
  globalThis.fetch = vi.fn();
  globalThis.console.error = vi.fn();
});

beforeEach(() => {
  localStorage.clear();
  fetch.mockReset();
  console.error.mockReset();
});

// ========================
// getLessons
// ========================
describe("getLessons", () => {
  it("fetches lessons successfully", async () => {
    localStorage.setItem("token", "token123");
    const mockLessons = [{ date: "2025-10-25", timeLength: "10:00-11:00" }];
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons: mockLessons }),
    });

    const lessons = await lib.getLessons("true");
    expect(lessons).toEqual(mockLessons);
    expect(fetch).toHaveBeenCalledWith("/api/lessons", {
      headers: { Authorization: "Bearer token123", available: "true" },
    });
  });

  it("throws error when response not ok", async () => {
    localStorage.setItem("token", "token123");
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "fail" }),
    });

    await expect(lib.getLessons("true")).rejects.toThrow("fail");
    expect(console.error).toHaveBeenCalled();
  });
});

// ========================
// preprocessLessons
// ========================
describe("preprocessLessons", () => {
  it("adds _year, _month, _day, _startDate", () => {
    const lessons = [{ date: "2025-10-25", timeLength: "09:30-10:30" }];
    const processed = lib.preprocessLessons(lessons);
    expect(processed[0]._year).toBe(2025);
    expect(processed[0]._month).toBe(10);
    expect(processed[0]._day).toBe(25);
    expect(processed[0]._startDate instanceof Date).toBe(true);
    expect(processed[0]._startDate.getHours()).toBe(9);
    expect(processed[0]._startDate.getMinutes()).toBe(30);
  });

  it("handles time without colon", () => {
    const lessons = [{ date: "2025-10-25", timeLength: "9-10:30" }];
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
    const lessons = [
      { date: "2025-10-02", timeLength: "10:00-11:00" },
      { date: "2025-11-03", timeLength: "11:00-12:00" },
    ];
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons }),
    });

    const result = await lib.getLessonsForMonth(date, "token123");
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-10-02");
  });

  it("returns empty array on fetch failure", async () => {
    fetch.mockRejectedValue(new Error("fail"));
    const result = await lib.getLessonsForMonth(new Date(), "token123");
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
