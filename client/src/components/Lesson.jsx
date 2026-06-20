import * as lessonLib from "../utils/calendar-library";

export default function Lesson({ lesson, onLessonAdded }) {
  const handleAddLesson = async () => {
    try {
      const updatedLesson = await lessonLib.addLesson(lesson);

      console.log("Lesson assigned:", updatedLesson);

      if (onLessonAdded) {
        onLessonAdded(updatedLesson);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="lesson">
      <h4 className="lesson__timeLength">{lesson.timeLength}</h4>
      <p className="lesson__type">{lesson.type}</p>
      <p className="lesson__guests">{lesson.guests} guests</p>

      {lesson.assignedTo === "None" && (
        <button className="calendar__lesson-btn" onClick={handleAddLesson}>
          Add Lesson
        </button>
      )}
    </div>
  );
}