import { useEffect, useState } from "react";
import Calendar from "../components/calendar-dir/Calendar";
import InstructorControlls from "../components/InstructorControlls";
import * as lib from "../utils/calendar-library.js";

function Instructor() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    async function fetchLessons() {
      const token = localStorage.getItem("token");
      if (!token) return; // ProtectedRoute handles redirect

      try {
        const fetchedLessons = await lib.getLessonsForMonth(
          currentDate,
          token
        );
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
          onAddLesson={(lesson) =>
            console.log("Instructor clicked:", lesson)
          }
          title="Instructor Calendar"
        />
      </section>

      <InstructorControlls />
    </main>
  );
}

export default Instructor;
