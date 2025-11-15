import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as lib from "./calendar-library.js";

// ========================
// Global Mock DOM
// ========================
beforeAll(() => {
  const mockMonthYear = { innerText: "", textContent: "", style: {}, className: "" };
  const mockCalendarDates = { innerHTML: "", appendChild: vi.fn(), style: {}, className: "" };

  global.document = {
    getElementById: vi.fn((id) => {
      if (id === "monthYear") return mockMonthYear;
      if (id === "calendarDates") return mockCalendarDates;
      return null;
    }),
    createDocumentFragment: () => ({ appendChild: vi.fn() }),
    createElement: (tag) => ({ tagName: tag.toUpperCase(), className: "", innerHTML: "" }),
    getElementsByClassName: vi.fn(() => []),
  };

  global.mockMonthYear = mockMonthYear;
  global.mockCalendarDates = mockCalendarDates;

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
  beforeEach(() => localStorage.clear());

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
    const date = new Date(2025, 9, 15);
    const context = lib.getCalendarContext(date);
    expect(context.year).toBe(2025);
    expect(context.month).toBe(9);
  });

  it("calculates first day and days in month correctly", () => {
    const date = new Date(2025, 9, 1);
    const context = lib.getCalendarContext(date);
    expect(context.firstDay).toBe(new Date(2025, 9, 1).getDay());
    expect(context.daysInMonth).toBe(31);
  });

  it("returns DOM references correctly", () => {
    const context = lib.getCalendarContext(new Date());
    expect(context.dom.monthYear).toBe(mockMonthYear);
    expect(context.dom.calendarDates).toBe(mockCalendarDates);
  });
});

// ========================
// createEle
// ========================
describe("createEle", () => {
  const ele = lib.createEle();

  it("generates timeslot HTML", () => {
    expect(ele.timeslot("10:00-11:00")).toBe('<h4 class="date__time-slot">10:00-11:00</h4>');
  });

  it("generates lesson type HTML", () => {
    expect(ele.type("Yoga")).toBe('<span class="date__lesson-type">Yoga</span>');
  });

  it("generates day container HTML", () => {
    expect(ele.dayCont(5)).toBe('<h3 class="date__day">5</h3>');
  });

  it("generates addLesson button HTML", () => {
    expect(ele.addLesson()).toBe('<button class="btn date__button-add-lesson">Add Lesson</button>');
  });
});

// ========================
// blankDays
// ========================
describe("blankDays", () => {
  it("appends a fragment with correct number of blank divs to calendarDates", () => {
    // Mock document.createDocumentFragment to capture appended children
    const appendedChildren = [];
    document.createDocumentFragment = () => ({
      appendChild: (child) => appendedChildren.push(child),
    });

    const mockDom = { calendarDates: { appendChild: vi.fn() } };

    lib.blankDays(3, mockDom);

    // dom.calendarDates.appendChild should be called once with the fragment
    expect(mockDom.calendarDates.appendChild).toHaveBeenCalledTimes(1);

    // The fragment should contain 3 children (blank divs)
    expect(appendedChildren).toHaveLength(3);
    appendedChildren.forEach((child) => {
      expect(child.tagName).toBe("DIV");
    });
  });
});


// ========================
// addLessonBtn
// ========================
describe("addLessonBtn", () => {
  it("attaches click listeners to addLesson buttons", async () => {
    const lessons = [{ _id: "1" }, { _id: "2" }];
    const token = "fake-token";
    localStorage.setItem("token", token);

    const btn1 = { addEventListener: vi.fn() };
    const btn2 = { addEventListener: vi.fn() };
    document.getElementsByClassName = vi.fn(() => [btn1, btn2]);

    global.assignLesson = vi.fn().mockResolvedValue({});
    await lib.addLessonBtn(lessons);

    expect(btn1.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
    expect(btn2.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
  });
});

// ========================
// renderCalendar (thorough tests)
// ========================
describe("renderCalendar", () => {
  beforeEach(() => {
    mockMonthYear.textContent = "";
    mockCalendarDates.innerHTML = "";
    global.fetch = vi.fn();
  });

  it("renders calendar with lessons and updates DOM", async () => {
    const lessons = [
      { _id: "1", date: "2025-10-02", timeLength: "10:00-11:00", type: "Yoga" },
      { _id: "2", date: "2025-10-03", timeLength: "11:00-12:00", type: "Cardio" },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons }),
    });

    await lib.renderCalendar({
      date: new Date(2025, 9, 1),
    });

    expect(mockMonthYear.textContent).toBe("October 2025");
    expect(mockCalendarDates.innerHTML).toContain('<h3 class="date__day">2</h3>');
    expect(mockCalendarDates.innerHTML).toContain('<span class="date__lesson-type">Yoga</span>');
    expect(mockCalendarDates.innerHTML).toContain('<span class="date__lesson-type">Cardio</span>');
  });

  it("applies lessonFilter correctly", async () => {
    const lessons = [
      { _id: "1", date: "2025-10-02", timeLength: "10:00-11:00", type: "Yoga" },
      { _id: "2", date: "2025-10-03", timeLength: "11:00-12:00", type: "Cardio" },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons }),
    });

    await lib.renderCalendar({
      date: new Date(2025, 9, 1),
      lessonFilter: (lesson) => lesson.type === "Yoga",
    });

    expect(mockCalendarDates.innerHTML).toContain('<span class="date__lesson-type">Yoga</span>');
    expect(mockCalendarDates.innerHTML).not.toContain('<span class="date__lesson-type">Cardio</span>');
  });

  it("applies extraDayHTML correctly", async () => {
    const lessons = [
      { _id: "1", date: "2025-10-02", timeLength: "10:00-11:00", type: "Yoga" },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons }),
    });

    await lib.renderCalendar({
      date: new Date(2025, 9, 1),
      extraDayHTML: (lesson) => `<span class="extra">${lesson._id}</span>`,
    });

    expect(mockCalendarDates.innerHTML).toContain('<span class="extra">1</span>');
  });

  it("calls onComplete callback with filtered lessons", async () => {
    const lessons = [
      { _id: "1", date: "2025-10-02", timeLength: "10:00-11:00", type: "Yoga" },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons }),
    });

    const onComplete = vi.fn();
    await lib.renderCalendar({
      date: new Date(2025, 9, 1),
      onComplete,
    });

    expect(onComplete).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ _id: "1" }),
    ]));
  });

  it("sorts multiple lessons on same day by start time", async () => {
    const lessons = [
      { _id: "1", date: "2025-10-02", timeLength: "12:00-13:00", type: "Yoga" },
      { _id: "2", date: "2025-10-02", timeLength: "10:00-11:00", type: "Cardio" },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ lessons }),
    });

    await lib.renderCalendar({
      date: new Date(2025, 9, 1),
    });

    const firstIndex = mockCalendarDates.innerHTML.indexOf('Cardio');
    const secondIndex = mockCalendarDates.innerHTML.indexOf('Yoga');
    expect(firstIndex).toBeLessThan(secondIndex); // sorted by time
  });
});
