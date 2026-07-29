import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Calendar from "../Calendar";
import CalendarDate from "../CalendarDate";
import CalendarDates from "../CalendarDates";
import CalendarDay from "../CalendarDay";
import CalendarDays from "../CalendarDays";
import CalendarHeader from "../CalendarHeader";
import CalendarMonthYear from "../CalendarMonthYear";
import CalendarNav from "../CalendarNav";
import type { Lesson } from "../../../types/domain";

describe("calendar components", () => {
  const currentDate = new Date(2026, 0, 10);

  it("renders Calendar wrapper with title", () => {
    const html = renderToStaticMarkup(
      <Calendar
        currentDate={currentDate}
        onMonthChange={() => {}}
        lessons={[]}
        title="Instructor Calendar"
      />
    );

    expect(html).toContain("Instructor Calendar");
    expect(html).toContain("calendar__dates");
  });

  it("renders CalendarDate with lesson count", () => {
    const html = renderToStaticMarkup(
      <CalendarDate day={currentDate} lessons={[]} />
    );

    expect(html).toContain("0 lessons");
  });

  it("renders CalendarDates for current month", () => {
    const lessons: Lesson[] = [
      {
        _id: "l1",
        type: "beginner",
        date: "2026-01-10",
        timeLength: "9-12",
        guests: 2,
        assignedTo: null,
      },
    ];

    const html = renderToStaticMarkup(
      <CalendarDates currentDate={currentDate} lessons={lessons} />
    );

    expect(html).toContain("calendar__dates");
  });

  it("renders CalendarDay label", () => {
    const html = renderToStaticMarkup(<CalendarDay dayName="Mon" />);
    expect(html).toContain("Mon");
  });

  it("renders all week day labels", () => {
    const html = renderToStaticMarkup(<CalendarDays />);

    expect(html).toContain("Sun");
    expect(html).toContain("Mon");
    expect(html).toContain("Sat");
  });

  it("renders CalendarHeader and month-year text", () => {
    const html = renderToStaticMarkup(
      <CalendarHeader currentDate={currentDate} onMonthChange={() => {}} />
    );

    expect(html).toContain("2026");
    expect(html).toContain("Next month");
    expect(html).toContain("Previous month");
  });

  it("renders CalendarMonthYear content", () => {
    const html = renderToStaticMarkup(
      <CalendarMonthYear>January 2026</CalendarMonthYear>
    );

    expect(html).toContain("January 2026");
  });

  it("renders CalendarNav direction label", () => {
    const html = renderToStaticMarkup(
      <CalendarNav dir="next" onClick={() => {}} arrow=">" />
    );

    expect(html).toContain("Next month");
  });
});
