export default function CalendarNav({
  dir,
  onClick,
  arrow,
}: {
  dir: "next" | "prev";
  onClick: () => void;
  arrow: string;
}) {
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
