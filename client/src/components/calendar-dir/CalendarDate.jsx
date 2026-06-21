import { useState, useEffect } from "react";
import Lesson from "../Lesson";

function CalendarDate({ day, lessons = [], onAddLesson }) {
  const [localLessons, setLocalLessons] = useState([]);
  const [showLessons, setShowLessons] = useState(false);

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  const handleClick = () => {
    if (localLessons.length > 0) {
      setShowLessons((prev) => !prev);
    }
  };

  const handleLessonAdded = (updatedLesson) => {
    setLocalLessons((prev) =>
      prev.filter((lesson) => lesson._id !== updatedLesson._id)
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
      aria-disabled={!isInteractive ? true : undefined}
      aria-label={`${day.toDateString()}, ${lessonCount} lessons`}
    >
      <span>{day.getDate()}</span>
      <p>{lessonCount} lessons</p>
      {showLessons &&
        localLessons.map((lesson) => (
          <Lesson
            key={lesson._id}
            lesson={lesson}
            onLessonAdded={handleLessonAdded}
          />
        ))}
      </div>
  );
}

export default CalendarDate;