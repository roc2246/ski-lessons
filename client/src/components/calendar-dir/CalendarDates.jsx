import React from "react";
import CalendarDate from "./CalendarDate";

export default function CalendarDates({ currentDate, lessons = [], onAddLesson }) {
  // Generate all dates for the current month
  const dates = Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) =>
    new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  return (
    <div className="calendar__dates">
      {dates.map((day) => {
        const lessonsForDay = lessons.filter(
          (lesson) => new Date(lesson.date).toDateString() === day.toDateString()
        );

        return (
          <CalendarDate key={day.toISOString()} day={day} lessons={lessonsForDay} onAddLesson={onAddLesson} />
        );
      })}
    </div>
  );
}
