import React from "react";
import CalendarDate from "./CalendarDate";

function parseLocalDate(dateString) {
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