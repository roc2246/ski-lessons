import React from "react";
import CalendarNav from "./CalendarNav";
import CalendarMonthYear from "./CalendarMonthYear";
import "../../styles/calendar.css";

export default function CalendarHeader({ currentDate, onMonthChange }) {
  const monthYearString = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const handleMonth = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + dir);
    onMonthChange(newDate);
  };

  return (
    <div className="calendar__header">
      <CalendarNav dir="prev" onClick={() => handleMonth(-1)} arrow="←" />
      <CalendarMonthYear>{monthYearString}</CalendarMonthYear>
      <CalendarNav dir="next" onClick={() => handleMonth(1)} arrow="→" />
    </div>
  );
}
