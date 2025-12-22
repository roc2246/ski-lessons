import { useState, useEffect } from "react";
import * as lessonLib from "../../utils/calendar-library";

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
        <div key={lesson._id} className="calendar__lesson">
          <h1>{lesson.type}</h1>

          {lesson.assignedTo === "None" && (
            <button
              className="calendar__lesson-btn"
              onClick={() => handleAddLesson(lesson)}
            >
              Add Lesson
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default CalendarDate;
