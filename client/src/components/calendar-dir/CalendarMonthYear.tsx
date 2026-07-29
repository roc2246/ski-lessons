import type { ReactNode } from "react";

export default function CalendarMonthYear({ children }: { children: ReactNode }) {
  return <div className="calendar__month-year">{children}</div>;
}
