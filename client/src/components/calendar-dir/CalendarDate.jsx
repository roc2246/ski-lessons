import { useState, useEffect } from "react";
import Lesson from "../Lesson";

function CalendarDate({ day, lessons = [], onLessonAdded }) {
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

    if (onLessonAdded) {
      onLessonAdded(updatedLesson);
    }
  };

  return (
    <div
      className="calendar__date"
      onClick={handleClick}
      style={{ cursor: localLessons.length > 0 ? "pointer" : "default" }}
    >
      <span>{day.getDate()}</span>
      {/* <p>{localLessons.length} lessons</p> */}
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