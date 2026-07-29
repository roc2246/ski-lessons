import React from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarDays from "./CalendarDays";
import CalendarDates from "./CalendarDates";
import type { Lesson } from "../../types/domain";

interface CalendarProps {
  currentDate: Date;
  onMonthChange: (value: Date) => void;
  lessons?: Lesson[];
  onAddLesson?: (lesson: Lesson) => void;
  title?: string;
}

export default function Calendar({
  currentDate,
  onMonthChange,
  lessons = [],
  onAddLesson,
  title = "",
}: CalendarProps) {
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
