import { useState, useEffect } from "react";
import Lesson from "../Lesson";

function CalendarDate({ day, lessons = [], onLessonAdded }) {
  const [localLessons, setLocalLessons] = useState([]);

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);



  return (
    <div className="calendar__date">
      <span>{day.getDate()}</span>

      {localLessons.map((lesson) => (
        <Lesson key={lesson._id} lesson={lesson} />
      ))}
    </div>
  );
}

export default CalendarDate;
