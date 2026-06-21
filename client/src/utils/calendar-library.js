// ================================
// Calendar Library (React-friendly)
// ================================

function getDateParts(dateString) {
  const datePart = String(dateString).slice(0, 10);
  return datePart.split("-").map(Number);
}

/**
 * Fetch lessons from the API using the assignedTo filter when provided.
 */
export async function getLessons(assignedTo) {
  try {
    const token = localStorage.getItem("token");
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
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch lessons");
    }
    const { lessons } = await response.json();
    return lessons;
  } catch (err) {
    console.error("Error retrieving lessons:", err.message);
    throw err;
  }
}

/**
 * Preprocess lessons to add _year, _month, _day, _startDate
 * Handles both ISO date strings and YYYY-MM-DD format
 */
export function preprocessLessons(lessons) {
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
export function getMonthYear(date) {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get all dates for a month (array of numbers)
 */
export function getDatesForMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

/**
 * Generate array of Date objects for a month
 */
export function generateCalendarDates(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day));
  }
  return dates;
}

/**
 * Navigate to previous month
 */
export function prevMonth(currentMonthYear) {
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
export function nextMonth(currentMonthYear) {
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
export async function getLessonsForMonth(date, token, assignedTo) {
  try {
    if (!token) token = localStorage.getItem("token");
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
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch lessons");
    }
    const { lessons } = await response.json();

    // Filter lessons for the month
    const month = date.getMonth();
    const year = date.getFullYear();

    return lessons.filter((lesson) => {
      const [lessonYear, lessonMonth] = getDateParts(lesson.date);
      return lessonMonth - 1 === month && lessonYear === year;
    });
  } catch (err) {
    console.error("Error in getLessonsForMonth:", err);
    return [];
  }
}

/**
 * Fetch lessons for the current signed-in user for a specific month.
 * Keeps token lookup in one place so page components stay simple.
 */
export async function getCurrentMonthLessons(date, assignedTo) {
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
export async function addLesson(lesson) {
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
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add lesson");
    }

    const data = await response.json();
    return data.lesson; // returns updated lesson
  } catch (err) {
    console.error("Error adding lesson:", err);
    throw err;
  }
}
