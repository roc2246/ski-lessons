import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
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

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  const handleClick = () => {
    if (localLessons.length > 0) {
      setShowLessons((prev) => !prev);
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
        <div className="module" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
          <button className="btn" onClick={() => setShowLessons(false)}>
            X
          </button>
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
