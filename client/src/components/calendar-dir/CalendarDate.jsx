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
    <button
      type="button"
      className={`calendar__date${showLessons ? " active" : ""}`}
      onClick={handleClick}
      aria-expanded={isInteractive ? showLessons : undefined}
      aria-label={`${day.toDateString()}, ${lessonCount} lessons`}
      disabled={!isInteractive}
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
    </button>
  );
}

export default CalendarDate;