import { useState, useEffect } from "react";
import * as lib from "../utils/calendar-library";
import "../styles/calendar.css";

function Calendar() {
  const [calendar, setCalendar] = useState({ monthYear: "", dates: [] });

  useEffect(() => {
    const initCalendar = async () => {
      const today = new Date();
      // Compute values first
      const monthYear = lib.getMonthYear(today);
      const dates = lib.getDatesForMonth(today);

      // Update state once
      setCalendar({ monthYear, dates });
    };

    initCalendar();
  }, []);

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button className="calendar__nav calendar__nav--prev">←</button>
        <div className="calendar__month-year">{calendar.monthYear}</div>
        <button className="calendar__nav calendar__nav--next">→</button>
      </div>

      <div className="calendar__days">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar__day">{day}</div>
        ))}
      </div>

      <div className="calendar__dates">
        {calendar.dates.map((date) => (
          <div key={date} className="calendar__date">{date}</div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
