import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/calendar-dir/Calendar";
import * as lib from "../utils/calendar-library.js";
import LessonBoardControlls from "../components/LessonBoardControlls.jsx";

function LessonBoard() {
  const navigate = useNavigate();
  const assignedTo = "None";
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
      try {
        const fetchedLessons = await lib.getCurrentMonthLessons(currentDate, assignedTo);
        setLessons(fetchedLessons);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLessons();
  }, [currentDate]);

  const handleLessonAdded = (updatedLesson) => {
    setLessons((currentLessons) =>
      currentLessons.filter((lesson) => lesson._id !== updatedLesson._id)
    );
  };

  return (
    <main className="lesson-board">
      <section className="calendar-section">
        <Calendar
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          lessons={lessons}
          onAddLesson={handleLessonAdded}
          title="Pick Up Lesson"
        />
      </section> 
      <LessonBoardControlls />
    </main>
  );
}

export default LessonBoard;
