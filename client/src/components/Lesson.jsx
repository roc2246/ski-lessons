import * as lessonLib from "../../utils/calendar-library";

export default function Lesson({ lesson, key }) {
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
    <div className="lesson" key={key}>
      <h4 className="lesson__timeLength">{lesson.timeLength}</h4>
      <p className="lesson__type">{lesson.type}</p>
      <p className="lesson__guests">{lesson.guests} guests</p>
      {lesson.assignedTo === "None" && (
        <button
          className="calendar__lesson-btn"
          onClick={() => handleAddLesson(lesson)}
        >
          Add Lesson
        </button>
      )}
    </div>
  );
}
