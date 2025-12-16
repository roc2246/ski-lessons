import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// import "./InstructorPage.css"; // combine main.css + calendar.css if needed
import Calendar from "../components/Calendar"; // optional modular calendar component
import * as lib from "../utils/auth-library"; // move JS logic here

function Instructor() {
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  return (
    <main className="instructor">
      {/* Calendar Section */}
      <section className="calendar-section">
        <Calendar />
      </section>

      {/* Controls Section */}
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
        <Link to="/admin" className="instructor__link">
          Admin
        </Link>
      </section>
    </main>
  );
}

export default Instructor;
