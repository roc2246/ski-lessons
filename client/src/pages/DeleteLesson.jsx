import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminLib from "../utils/admin-library.js";

function DeleteLesson() {
  const [lessons, setLessons] = useState([]);
  const [status, setStatus] = useState("");

  // Fetch lessons on mount
  useEffect(() => {
    async function fetchLessons() {
      try {
        const fetchedLessons = await adminLib.getAllLessons();
        setLessons(fetchedLessons);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
        setStatus("Failed to load lessons.");
      }
    }
    fetchLessons();
  }, []);

  // Handle lesson deletion
  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    setStatus("Deleting lesson...");
    try {
      await adminLib.lessonDelete(lessonId);
      alert("Lesson deleted successfully!");
      // Remove the deleted lesson from state
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setStatus("Failed to delete lesson.");
    }
  };

  return (
    <main className="admin">
      <h1 className="admin__header">DELETE LESSON</h1>
      {status && <p>{status}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {lessons.length === 0 ? (
          <p>No lessons available to delete.</p>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson._id} className="lesson-item">
              <span>
                {lesson.type} - {new Date(lesson.date).toLocaleDateString()} -{" "}
                {lesson.assignedTo || "Unassigned"}
              </span>
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