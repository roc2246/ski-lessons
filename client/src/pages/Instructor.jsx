import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Calendar from "../components/calendar-dir/Calendar";
import InstructorControlls from "../components/InstructorControlls";
import * as lib from "../utils/calendar-library.js";

function Instructor() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]); // optional if showing calendar lessons

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function fetchLessons() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const fetchedLessons = await lib.getLessonsForMonth(currentDate, token, "false");
        setLessons(fetchedLessons);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLessons();
  }, [currentDate]);

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
