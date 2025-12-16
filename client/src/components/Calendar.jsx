import React from "react";
import "../styles/calendar.css";
import * as lib from "../utils/calendar-library.js";

export default function Calendar({ currentDate, onMonthChange, lessons = [], onAddLesson, title }) {
  const monthYearString = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  return (
    <div className="calendar">
      {title && <h1 className="calendar__title">{title}</h1>}

      <div className="calendar__header">
        <button
          className="calendar__nav calendar__nav--prev"
          aria-label="Previous month"
          onClick={handlePrevMonth}
        >
          ←
        </button>
        <div className="calendar__month-year">{monthYearString}</div>
        <button
          className="calendar__nav calendar__nav--next"
          aria-label="Next month"
          onClick={handleNextMonth}
        >
          →
        </button>
      </div>

      <div className="calendar__days">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar__day">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar__dates">
        {lib.generateCalendarDates(currentDate).map((day) => {
          const lessonsForDay = lessons.filter(
            (lesson) => new Date(lesson.date).toDateString() === day.toDateString()
          );
          return (
            <div key={day} className="calendar__date">
              <span>{day.getDate()}</span>
              {lessonsForDay.map((lesson) => (
                <button
                  key={lesson.id}
                  className="calendar__lesson-btn"
                  onClick={() => onAddLesson && onAddLesson(lesson)}
                >
                  Add Lesson
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
