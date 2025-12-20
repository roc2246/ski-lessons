import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as adminLib from "../utils/admin-library.js";
import "../styles/main.css";
import CreateLessonField from "../components/CreateLessonField.jsx";

function CreateLesson() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    date: "",
    timeLength: "",
    guests: 1,
    assignedTo: "None",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    async function checkAdmin() {
      try {
        const isAdmin = await adminLib.isAdmin(token);
        if (!isAdmin) {
          alert("You must have admin privileges to access this page");
          navigate("/instructor");
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        alert("Unable to verify admin status. Please login again.");
        navigate("/instructor");
      }
    }

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await adminLib.getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setStatus("Failed to load instructors.");
      }
    }
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Creating lesson...");
    try {
      await adminLib.lessonCreate(formData);
      alert("Lesson created successfully!");
      setFormData({
        type: "",
        date: "",
        timeLength: "",
        guests: 1,
        assignedTo: "None",
      });
      setStatus("");
    } catch (err) {
      console.error(err);
      alert("Failed to create lesson.");
      setStatus("Failed to create lesson.");
    }
  };

  return (
    <main className="create-lesson">
      <h1 className="create-lesson__header">Create Lesson</h1>

      <div
        id="instructor-status"
        aria-live="polite"
        style={{ marginBottom: "0.75rem" }}
      >
        {status}
      </div>

      <form className="create-lesson__form" onSubmit={handleSubmit}>
        <CreateLessonField
          label="Lesson Type:"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        />

        <CreateLessonField
          label="Date:"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <CreateLessonField
          label="Length (Hours):"
          type="number"
          name="timeLength"
          min={1}
          value={formData.timeLength}
          onChange={handleChange}
          required
        />

        <CreateLessonField
          label="Number of Guests:"
          type="number"
          name="guests"
          min={1}
          value={formData.guests}
          onChange={handleChange}
          required
        />

        <CreateLessonField
          label="Assigned Instructor:"
          type="select"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          options={[
            { value: "None", label: "None" },
            ...users.map((u) => ({ value: u._id, label: u.username })),
          ]}
          required
        />

        <button type="submit" id="create-btn">
          Create Lesson
        </button>
      </form>

      <Link to="/admin-home" className="create-lesson__link">
        Back
      </Link>
    </main>
  );
}

export default CreateLesson;
