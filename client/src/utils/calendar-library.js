// ================================
// Calendar Library (React-friendly)
// ================================

/**
 * Fetch all lessons from the API
 */
export async function getLessons(available) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/lessons", {
      headers: { Authorization: `Bearer ${token}`, available },
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
 */
export function preprocessLessons(lessons) {
  return lessons.map((lesson) => {
    const [year, month, day] = lesson.date.split("-").map(Number);
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
