import React from "react";
import CalendarHeader from "./CalendarHeader.jsx";
import CalendarDays from "./CalendarDays.jsx";
import CalendarDates from "./CalendarDates.jsx";
import "../../styles/calendar.css";

export default function Calendar({
  currentDate,
  onMonthChange,
  lessons = [],
  onAddLesson,
  title = "",
}) {
  return (
    <div className="calendar">
      {title && <h1 className="calendar__title">{title}</h1>}

      <CalendarHeader currentDate={currentDate} onMonthChange={onMonthChange} />

      <CalendarDays />

      <CalendarDates
        currentDate={currentDate}
        lessons={lessons}
        onAddLesson={onAddLesson}
      />
    </div>
  );
}
