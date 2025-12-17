import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Calendar from "../components/calendar-dir/Calendar";
import InstructorControlls from "../components/InstructorControlls";

function Instructor() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]); // optional if showing calendar lessons

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  return (
    <main className="instructor">
      <section className="calendar-section">
        <Calendar
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          lessons={lessons}
          onAddLesson={(lesson) => console.log("Instructor clicked:", lesson)}
          title="Instructor Calendar"
        />
      </section>

      <InstructorControlls/>
    </main>
  );
}

export default Instructor;
