import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Calendar from "../components/calendar-dir/Calendar";
import * as lib from "../utils/auth-library";

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

      <section className="instructor__controls">
        <h1 className="instructor__title">Logged In</h1>

        <button
          className="btn btn--secondary instructor__btn"
          onClick={() => {
            lib.logout();
            navigate("/");
          }}
        >
          Logout
        </button>

        <button
          className="btn btn--danger instructor__btn"
          onClick={() => lib.deleteAccount(navigate)}
        >
          Delete Account
        </button>

        <Link to="/lesson-board" className="instructor__link">
          Lesson Board
        </Link>
        <Link to="/admin-home" className="instructor__link">
          Admin
        </Link>
      </section>
    </main>
  );
}

export default Instructor;
