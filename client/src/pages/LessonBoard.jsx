import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as lib from "../utils/calendar-library.js";
import { logout } from "../utils/auth-library.js";
import "../styles/main.css";
import "../styles/calendar.css";

function LessonBoard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);

  // Redirect to login if not logged in
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

  // Filter lessons that are not assigned
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => lesson.assignedTo === "None");
  }, [lessons]);

  // Calendar navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Logout handler (passes token to logout and navigates)
  const handleLogout = () => {
    const token = localStorage.getItem("token");
    logout(token);
    navigate("/login");
  };

  const monthYearString = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="lesson-board">
      <section className="calendar-section">
        <h1 className="lesson-board__title">Pick Up Lesson</h1>

        <div className="calendar">
          <div className="calendar__header">
            <button
              className="calendar__nav calendar__nav--prev"
              aria-label="Previous month"
              onClick={handlePrevMonth}
            >
              ←
            </button>
            <div className="calendar__month-year">{monthYearString}</div>
            <button
              className="calendar__nav calendar__nav--next"
              aria-label="Next month"
              onClick={handleNextMonth}
            >
              →
            </button>
          </div>

          <div className="calendar__days">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="calendar__day">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar__dates">
            {lib.generateCalendarDates(currentDate).map((day) => {
              const lessonsForDay = filteredLessons.filter(
                (lesson) => new Date(lesson.date).toDateString() === day.toDateString()
              );
              return (
                <div key={day} className="calendar__date">
                  <span>{day.getDate()}</span>
                  {lessonsForDay.map((lesson) => (
                    <button
                      key={lesson.id}
                      className="calendar__lesson-btn"
                      onClick={() => lib.addLesson(lesson)}
                    >
                      Add Lesson
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="lesson-board__controls">
        <button
          id="logoutBtn"
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
