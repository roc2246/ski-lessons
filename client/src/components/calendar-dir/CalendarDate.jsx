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
      setShowLessons((prev) => !prev); // toggle on click
    }
  };

  return (
    <div className="calendar__date" onClick={handleClick} style={{ cursor: localLessons.length > 0 ? "pointer" : "default" }}>
      <span>{day.getDate()}</span>

      {showLessons &&
        localLessons.map((lesson) => (
          <Lesson key={lesson._id} lesson={lesson} />
        ))}
    </div>
  );
}

export default CalendarDate;
