export default function CalendarNav({ dir, onClick, arrow }) {
  return (
    <button
      className={`calendar__nav calendar__nav--${dir}`}
      onClick={onClick}
      aria-label={`${dir === "next" ? "Next month" : "Previous month"}`}
    >
      {arrow}
    </button>
  );
}
