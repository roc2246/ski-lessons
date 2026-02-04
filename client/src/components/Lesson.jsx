export default function Lesson({ lesson }) {
  return (
    <div className="lesson">
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
