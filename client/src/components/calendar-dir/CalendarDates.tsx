import CalendarDate from "./CalendarDate";
import type { Lesson } from "../../types/domain";

function getDateParts(dateString: string) {
  const datePart = String(dateString).slice(0, 10);
  return datePart.split("-").map(Number);
}


function parseLocalDate(dateString: string): Date {
  const [year, month, day] = getDateParts(dateString);
  return new Date(year, month - 1, day);
}

function isSameCalendarDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function CalendarDates({
  currentDate,
  lessons = [],
  onAddLesson,
}: {
  currentDate: Date;
  lessons?: Lesson[];
  onAddLesson?: (lesson: Lesson) => void;
}) {
  const firstDayOffset = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const dates = Array.from(
    {
      length: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate(),
    },
    (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  return (
    <div className="calendar__dates">
      {Array.from({ length: firstDayOffset }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="calendar__date calendar__date--empty"
          aria-hidden="true"
        />
      ))}
      {dates.map((day) => {
        const lessonsForDay = lessons.filter((lesson: Lesson) => {
          const lessonDate = parseLocalDate(lesson.date);
          return isSameCalendarDay(lessonDate, day);
        });

        return (
          <CalendarDate
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            day={day}
            lessons={lessonsForDay}
            onAddLesson={onAddLesson}
          />
        );
      })}
    </div>
  );
}
