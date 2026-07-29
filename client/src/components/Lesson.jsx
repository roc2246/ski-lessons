import * as lessonLib from "../utils/calendar-library";

function formatLessonDate(value) {
  const datePart = String(value ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return "";
  }

  const [year, month, day] = datePart.split("-");
  return `${month}/${day}/${year}`;
}

export default function Lesson({ lesson, onLessonAdded }) {
  const handleAddLesson = async () => {
    try {
      const updatedLesson = await lessonLib.addLesson(lesson);

      console.log("Lesson assigned:", updatedLesson);

      if (onLessonAdded) {
        onLessonAdded(updatedLesson);
      }
    } catch (err) {
      alert(
        `User is already assigned to a lesson on ${formatLessonDate(lesson.date)} at ${lesson.timeLength}`,
      );
      console.error(err);
    }
  };

  return (
    <div className="lesson">
      <h4 className="lesson__timeLength">{lesson.timeLength}</h4>
      <p className="lesson__type">{lesson.type}</p>
      <p className="lesson__guests">{lesson.guests} guests</p>

      {/* Backend now uses null instead of "None" for unassigned lessons */}
      {!lesson.assignedTo && (
        <button className="calendar__lesson-btn" onClick={handleAddLesson}>
          Add Lesson
        </button>
      )}
    </div>
  );
}
