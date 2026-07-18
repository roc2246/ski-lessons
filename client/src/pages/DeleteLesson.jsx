import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminLib from "../utils/admin-library.js";
import * as calendarLib from "../utils/calendar-library.js";

function DeleteLesson() {
  const [lessons, setLessons] = useState([]);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userLookup, setUserLookup] = useState({});

  useEffect(() => {
    async function fetchLessons() {
      try {
        const fetchedLessons = await calendarLib.getLessons("all");
        setLessons(fetchedLessons);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
        setStatus("Failed to load lessons.");
      }
    }

    async function fetchUsers() {
      try {
        const users = await adminLib.getUsers();
        const lookup = Object.fromEntries(users.map((user) => [user._id, user.username]));
        setUserLookup(lookup);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }

    fetchLessons();
    fetchUsers();
  }, []);

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    setStatus("Deleting lesson...");
    try {
      await adminLib.lessonDelete(lessonId);
      alert("Lesson deleted successfully!");
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setStatus("Failed to delete lesson.");
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const assignedToLabel = lesson.assignedTo ? (userLookup[lesson.assignedTo] || lesson.assignedTo) : "Unassigned";
    const haystack = `${lesson.type || ""} ${new Date(lesson.date).toLocaleDateString()} ${lesson.timeLength || ""} ${assignedToLabel}`.toLowerCase();
    return haystack.includes(query);
  });

  return (
    <main className="admin">
      <h1 className="admin__header">DELETE LESSON</h1>
      {status && <p>{status}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredLessons.length === 0 ? (
          <p>No lessons available to delete.</p>
        ) : (
          filteredLessons.map((lesson) => (
            <div key={lesson._id} className="lesson-item">
              <span>
                {lesson.type} - {new Date(lesson.date).toLocaleDateString()} - {lesson.timeLength} - {lesson.assignedTo ? (userLookup[lesson.assignedTo] || lesson.assignedTo) : "Unassigned"}
              </span>
              &nbsp;
              <button onClick={() => handleDelete(lesson._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
      <Link to="/admin-home" className="admin__link">
        Back to Admin Home
      </Link>
    </main>
  );
}

export default DeleteLesson;