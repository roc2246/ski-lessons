import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import Lesson from "../Lesson";
import type { Lesson as LessonType } from "../../types/domain";

interface CalendarDateProps {
  day: Date;
  lessons?: LessonType[];
  onAddLesson?: (lesson: LessonType) => void;
}

function CalendarDate({ day, lessons = [], onAddLesson }: CalendarDateProps) {
  const [localLessons, setLocalLessons] = useState<LessonType[]>([]);
  const [showLessons, setShowLessons] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  useEffect(() => {
    if (showLessons) {
      closeButtonRef.current?.focus();
    }
  }, [showLessons]);

  const handleClick = () => {
    if (localLessons.length > 0) {
      setShowLessons((prev) => !prev);
    }
  };

  const handleDateKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setShowLessons((prev) => !prev);
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setShowLessons(false);
    }
  };

  const handleLessonAdded = (updatedLesson: LessonType) => {
    setLocalLessons((prev) =>
      prev.filter((lesson) => lesson._id !== updatedLesson._id),
    );

    if (onAddLesson) {
      onAddLesson(updatedLesson);
    }
  };

  const lessonCount = localLessons.length;
  const isInteractive = lessonCount > 0;

  return (
    <div
      className={`calendar__date${showLessons ? " active" : ""}`}
      onClick={handleClick}
      onKeyDown={handleDateKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-expanded={isInteractive ? showLessons : undefined}
      aria-disabled={!isInteractive}
      aria-label={`${day.toDateString()}, ${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`}
    >
      <span>{day.getDate()}</span>
      {/* {isInteractive && <span className="calendar__mark">&bull;</span>} */}
      <p>{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</p>

      {showLessons && (
        <div
          className="module"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`lesson-dialog-title-${day.toISOString().slice(0, 10)}`}
          onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          onKeyDown={handleDialogKeyDown}
        >
          <button
            ref={closeButtonRef}
            className="btn"
            onClick={() => setShowLessons(false)}
            aria-label="Close lesson details"
          >
            X
          </button>
          <h2 id={`lesson-dialog-title-${day.toISOString().slice(0, 10)}`} className="sr-only">
            Lessons for {day.toDateString()}
          </h2>
          <span className="lesson-date">{day.toDateString()}</span>
          {localLessons.map((lesson) => (
            <div key={lesson._id}>
              <Lesson lesson={lesson} onLessonAdded={handleLessonAdded} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarDate;
