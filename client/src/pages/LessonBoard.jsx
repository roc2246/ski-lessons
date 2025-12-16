import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Calendar from "../components/calendar-dir/Calendar";
import * as lib from "../utils/calendar-library.js";
import { logout } from "../utils/auth-library.js";
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

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    logout(token);
    navigate("/login");
  };

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

      <section className="lesson-board__controls">
        <button
          className="btn btn--secondary lesson-board__btn"
          onClick={handleLogout}
        >
          Logout
        </button>
        <Link to="/instructor" className="lesson-board__link">
          Back
        </Link>
      </section>
    </main>
  );
}

export default LessonBoard;
