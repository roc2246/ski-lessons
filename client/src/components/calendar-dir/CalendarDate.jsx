import React from "react";

export default function CalendarDate({ day, lessons = [], onAddLesson }) {
  return (
    <div className="calendar__date">
      <span>{day.getDate()}</span>
      {lessons.map((lesson) => (
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
}
