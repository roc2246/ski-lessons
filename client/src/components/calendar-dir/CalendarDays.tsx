import CalendarDay from "./CalendarDay";

export default function CalendarDays() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="calendar__days">
      {days.map((day) => (
        <CalendarDay key={day} dayName={day} />
      ))}
    </div>
  );
}
