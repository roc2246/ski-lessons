import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as lib from "./calander-library.js";

// ========================
// Global Mock DOM
// ========================
beforeAll(() => {
  // Create global mock DOM elements
  const mockMonthYear = { innerText: "", style: {}, className: "" };
  const mockCalendarDates = { innerHTML: "", style: {}, className: "" };

  global.document = {
    getElementById: vi.fn((id) => {
      if (id === "monthYear") return mockMonthYear;
      if (id === "calendarDates") return mockCalendarDates;
      return null;
    }),
  };

  // Make the mocks globally accessible
  global.mockMonthYear = mockMonthYear;
  global.mockCalendarDates = mockCalendarDates;

  // Mock localStorage for all tests
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

// ========================
// getCalendarContext
// ========================
describe("getCalendarContext", () => {
  it("returns correct year and month for a given date", () => {
    const date = new Date(2025, 9, 15); // October 15, 2025
    const context = lib.getCalendarContext(date);

    expect(context.year).toBe(2025);
    expect(context.month).toBe(9); // 0-indexed months
  });

  it("calculates first day of the month correctly", () => {
    const date = new Date(2025, 9, 1); // October 1, 2025
    const context = lib.getCalendarContext(date);

    expect(context.firstDay).toBe(new Date(2025, 9, 1).getDay());
  });

  it("calculates the correct number of days in the month", () => {
    const dateFeb2025 = new Date(2025, 1, 1); // February 2025
    const contextFeb = lib.getCalendarContext(dateFeb2025);
    expect(contextFeb.daysInMonth).toBe(28);

    const dateFeb2024 = new Date(2024, 1, 1); // February 2024, leap year
    const contextLeap = lib.getCalendarContext(dateFeb2024);
    expect(contextLeap.daysInMonth).toBe(29);

    const dateApril = new Date(2025, 3, 1); // April 2025
    const contextApril = lib.getCalendarContext(dateApril);
    expect(contextApril.daysInMonth).toBe(30);
  });

  it("returns the full array of month names", () => {
    const date = new Date();
    const context = lib.getCalendarContext(date);

    expect(context.monthNames).toEqual([
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ]);
  });

  it("returns DOM references correctly", () => {
    const date = new Date();
    const context = lib.getCalendarContext(date);

    expect(context.dom.monthYear).toBe(mockMonthYear);
    expect(context.dom.calendarDates).toBe(mockCalendarDates);
    expect(document.getElementById).toHaveBeenCalledWith("monthYear");
    expect(document.getElementById).toHaveBeenCalledWith("calendarDates");
  });

  it("updates the monthYear DOM element correctly", () => {
    const date = new Date(2025, 9, 15); // October 2025
    const context = lib.getCalendarContext(date);

    context.dom.monthYear.innerText = `${context.monthNames[context.month]} ${context.year}`;
    expect(mockMonthYear.innerText).toBe("October 2025");
  });

  it("handles months starting on different weekdays", () => {
    const march2025 = new Date(2025, 2, 1); // March 1, 2025
    const contextMarch = lib.getCalendarContext(march2025);
    expect(contextMarch.firstDay).toBe(new Date(2025, 2, 1).getDay());

    const sept2025 = new Date(2025, 8, 1); // September 1, 2025
    const contextSept = lib.getCalendarContext(sept2025);
    expect(contextSept.firstDay).toBe(new Date(2025, 8, 1).getDay());
  });

  it("allows calendarDates DOM element to be populated correctly", () => {
    const date = new Date(2025, 9, 15); // October 2025
    const context = lib.getCalendarContext(date);

    context.dom.calendarDates.innerHTML = Array.from(
      { length: context.daysInMonth },
      (_, i) => `<div class="day">${i + 1}</div>`
    ).join("");

    const days = context.dom.calendarDates.innerHTML.match(/<div class="day">(\d+)<\/div>/g);
    expect(days.length).toBe(context.daysInMonth);
    expect(days[0]).toBe('<div class="day">1</div>');
    expect(days[days.length - 1]).toBe(`<div class="day">${context.daysInMonth}</div>`);
  });
});
