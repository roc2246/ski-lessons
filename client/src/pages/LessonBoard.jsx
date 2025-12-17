import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Calendar from "../components/calendar-dir/Calendar";
import * as lib from "../utils/calendar-library.js";
import LessonBoardControlls from "../components/LessonBoardControlls.jsx";
import "../styles/main.css";
import "../styles/calendar.css";

function LessonBoard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Fetch lessons for the current month
  useEffect(() => {
    async function fetchLessons() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const fetchedLessons = await lib.getLessonsForMonth(currentDate, token);
        setLessons(fetchedLessons);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLessons();
  }, [currentDate]);

  // Filter unassigned lessons
  const filteredLessons = useMemo(
    () => lessons.filter((lesson) => lesson.assignedTo === "None"),
    [lessons]
  );

  return (
    <main className="lesson-board">
      <section className="calendar-section">
        <Calendar
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          lessons={filteredLessons}
          onAddLesson={(lesson) => lib.addLesson(lesson)}
          title="Pick Up Lesson"
        />
      </section> 
      <LessonBoardControlls />
    </main>
  );
}

export default LessonBoard;
