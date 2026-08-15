import type { CalendarLesson, Lesson } from "../types/domain";
import { getRequiredAuthToken } from "./token-library";
import { getErrorMessage, getString, isLesson, isLessonArray, readJsonObject } from "./response-guards";

// ================================
// Calendar Library (React-friendly)
// ================================

function getDateParts(dateString: string): number[] {
  const datePart = String(dateString).slice(0, 10);
  return datePart.split("-").map(Number);
}

/**
 * Fetch lessons from the API using the assignedTo filter when provided.
 * 
 * @param assignedTo - Optional filter: "None" for unassigned, userId for user's lessons, undefined for all
 * @returns Array of Lesson objects from the API
 * @throws Error if API call fails, token is invalid, or response is malformed
 */
export async function getLessons(assignedTo?: string): Promise<Lesson[]> {
  try {
    const token = getRequiredAuthToken();
    let url = "/api/lessons";

    if (assignedTo === "None") {
      url = "/api/lessons?assignedTo=None";
    } else if (assignedTo !== undefined) {
      url = `/api/lessons?assignedTo=${assignedTo}`;
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await readJsonObject(response);
      if (response.status === 401) {
        localStorage.removeItem("token");
      }
      throw new Error(getString(error.message) ?? "Failed to fetch lessons");
    }
    const data = await readJsonObject(response);
    if (!isLessonArray(data.lessons)) {
      throw new Error("Malformed response: missing lessons field");
    }

    return data.lessons;
  } catch (err: unknown) {
    console.error("Error retrieving lessons:", getErrorMessage(err));
    throw err;
  }
}

/**
 * Preprocess lessons to add computed date/time properties for calendar rendering.
 * 
 * Adds to each lesson:
 * - _year: Integer year
 * - _month: Integer month (1-12)
 * - _day: Integer day (1-31)
 * - _startDate: Date object for sorting/rendering start time
 * 
 * Handles both ISO date strings (2025-02-15) and legacy YYYY-MM-DD format.
 * 
 * @param lessons - Array of lessons from API
 * @returns Array of lessons with computed properties for UI consumption
 */
export function preprocessLessons(lessons: Lesson[]): CalendarLesson[] {
  return lessons.map((lesson) => {
    const [year, month, day] = getDateParts(lesson.date);

    const [startTime] = lesson.timeLength.split("-");
    const [hours = "0", minutes = "0"] = startTime.split(":");
    
    return {
      ...lesson,
      _year: year,
      _month: month,
      _day: day,
      _startDate: new Date(year, month - 1, day, +hours, +minutes),
    };
  });
}

/**
 * Get month name and year string from Date object
 */
export function getMonthYear(date: Date): string {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get all dates for a month (array of numbers)
 */
export function getDatesForMonth(date: Date): number[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

/**
 * Generate array of Date objects for a month
 */
export function generateCalendarDates(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates: Date[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day));
  }
  return dates;
}

/**
 * Navigate to previous month
 */
export function prevMonth(currentMonthYear: string): { newMonthYear: string; newDates: number[] } {
  const [monthStr, yearStr] = currentMonthYear.split(" ");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  let month = monthNames.indexOf(monthStr);
  let year = parseInt(yearStr, 10);

  month -= 1;
  if (month < 0) {
    month = 11;
    year -= 1;
  }

  const newDate = new Date(year, month);
  return {
    newMonthYear: getMonthYear(newDate),
    newDates: getDatesForMonth(newDate)
  };
}

/**
 * Navigate to next month
 */
export function nextMonth(currentMonthYear: string): { newMonthYear: string; newDates: number[] } {
  const [monthStr, yearStr] = currentMonthYear.split(" ");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  let month = monthNames.indexOf(monthStr);
  let year = parseInt(yearStr, 10);

  month += 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }

  const newDate = new Date(year, month);
  return {
    newMonthYear: getMonthYear(newDate),
    newDates: getDatesForMonth(newDate)
  };
}

/**
 * Fetch lessons for a specific month.
 * @param {Date} date - Any date in the month you want lessons for
 * @param {string} token - Optional auth token
 */
export async function getLessonsForMonth(date: Date, token?: string | null, assignedTo?: string): Promise<Lesson[]> {
  try {
    token = token || getRequiredAuthToken();
    let url = "/api/lessons";

    if (assignedTo === "None") {
      url = "/api/lessons?assignedTo=None";
    } else if (assignedTo !== undefined) {
      url = `/api/lessons?assignedTo=${assignedTo}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await readJsonObject(response);
      if (response.status === 401) {
        localStorage.removeItem("token");
      }
      throw new Error(getString(err.message) ?? "Failed to fetch lessons");
    }
    const data = await readJsonObject(response);
    if (!isLessonArray(data.lessons)) {
      throw new Error("Malformed response: missing lessons field");
    }
    const lessons = data.lessons;

    // Filter lessons for the month
    const month = date.getMonth();
    const year = date.getFullYear();

    return lessons.filter((lesson) => {
      const [lessonYear, lessonMonth] = getDateParts(lesson.date);
      return lessonMonth - 1 === month && lessonYear === year;
    });
  } catch (err: unknown) {
    console.error("Error in getLessonsForMonth:", err);
    throw err;
  }
}

/**
 * Fetch lessons for the current signed-in user for a specific month.
 * Keeps token lookup in one place so page components stay simple.
 */
export async function getCurrentMonthLessons(date: Date, assignedTo?: string): Promise<Lesson[]> {
  const token = localStorage.getItem("token");
  if (!token) return [];

  return getLessonsForMonth(date, token, assignedTo);
}

// utils/lesson-library.js

/**
 * Assign a lesson to the current user
 * @param {object} lesson - Lesson object containing at least the id
 * @returns {Promise<object>} - Updated lesson object
 */
export async function addLesson(lesson: Lesson): Promise<Lesson> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  try {
    const response = await fetch(`/api/lessons/${lesson._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await readJsonObject(response);
      if (response.status === 401) {
        localStorage.removeItem("token");
      }
      throw new Error(getString(errorData.message) ?? "Failed to add lesson");
    }

    const data = await readJsonObject(response);
    if (!isLesson(data.lesson)) {
      throw new Error("Malformed response: missing lesson field");
    }

    return data.lesson;
  } catch (err: unknown) {
    console.error("Error adding lesson:", err);
    throw err;
  }
}
