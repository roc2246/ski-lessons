import { useState, useEffect } from "react";
import * as lessonLib from "../../utils/calendar-library";
import Lesson from "../Lesson";

function CalendarDate({ day, lessons = [], onLessonAdded }) {
  const [localLessons, setLocalLessons] = useState([]);

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  const handleAddLesson = async (lesson) => {
    try {
      const updatedLesson = await lessonLib.addLesson(lesson);
      console.log("Lesson assigned:", updatedLesson);

      // Remove the lesson from local list so it disappears
      setLocalLessons((prev) => prev.filter((l) => l._id !== lesson._id));

      if (onLessonAdded) onLessonAdded(updatedLesson);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="calendar__date">
      <span>{day.getDate()}</span>

      {localLessons.map((lesson) => (
        <Lesson lesson={lesson} />
      ))}
    </div>
  );
}

export default CalendarDate;
