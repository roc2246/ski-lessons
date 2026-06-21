import React from "react";
import CalendarDate from "./CalendarDate";


function parseLocalDate(dateString) {
  // Handle ISO date format (e.g., "2025-12-25T00:00:00.000Z")
  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  // Handle YYYY-MM-DD format
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameCalendarDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function CalendarDates({
  currentDate,
  lessons = [],
  onAddLesson,
}) {
  const firstDayOffset = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const dates = Array.from(
    {
      length: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate(),
    },
    (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  return (
    <div className="calendar__dates">
      {Array.from({ length: firstDayOffset }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="calendar__date calendar__date--empty"
          aria-hidden="true"
        />
      ))}
      {dates.map((day) => {
        const lessonsForDay = lessons.filter((lesson) => {
          const lessonDate = parseLocalDate(lesson.date);
          return isSameCalendarDay(lessonDate, day);
        });

        return (
          <CalendarDate
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            day={day}
            lessons={lessonsForDay}
            onAddLesson={onAddLesson}
          />
        );
      })}
    </div>
  );
}
