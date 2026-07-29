import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import * as adminLib from "../utils/admin-library";
import * as calendarLib from "../utils/calendar-library";
import type { Lesson, LessonMutationInput, User } from "../types/domain";

function formatDateForInput(value: unknown) {
  if (!value) return "";

  // Keep calendar dates timezone-safe by working from YYYY-MM-DD strings.
  const datePart = String(value).slice(0, 10);
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(datePart) ? datePart : "";
}

function formatDateForDisplay(value: unknown) {
  const datePart = formatDateForInput(value);
  if (!datePart) return "";

  const [year, month, day] = datePart.split("-");
  return `${month}/${day}/${year}`;
}

function buildLessonLabel(lesson: Lesson, userLookup: Record<string, string>) {
  const assignedToLabel = lesson.assignedTo
    ? userLookup[lesson.assignedTo] || lesson.assignedTo
    : "Unassigned";

  return `${lesson.type} | ${formatDateForDisplay(lesson.date)} | ${lesson.timeLength} | ${assignedToLabel}`;
}

function UpdateLesson() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState<LessonMutationInput>({
    type: "beginner",
    date: "",
    timeLength: "9-12",
    guests: 1,
    assignedTo: "None",
  });

  const userLookup = useMemo(
    () => Object.fromEntries(users.map((user: User) => [user._id, user.username])),
    [users]
  );
  const isErrorStatus = status.toLowerCase().includes("failed");
  const isSuccessStatus = status.toLowerCase().includes("success");

  useEffect(() => {
    async function hydratePage() {
      try {
        const [fetchedLessons, fetchedUsers] = await Promise.all([
          calendarLib.getLessons("all"),
          adminLib.getUsers(),
        ]);

        setLessons(fetchedLessons);
        setUsers(fetchedUsers);

        if (fetchedLessons.length > 0) {
          setSelectedLessonId(fetchedLessons[0]._id);
        }
      } catch (error) {
        console.error("Failed to load update lesson data:", error);
        setStatus("Failed to load lessons.");
      }
    }

    hydratePage();
  }, []);

  useEffect(() => {
    if (!selectedLessonId) return;

    const selected = lessons.find((lesson: Lesson) => lesson._id === selectedLessonId);
    if (!selected) return;

    setFormData({
      type: selected.type || "beginner",
      date: formatDateForInput(selected.date),
      timeLength: selected.timeLength || "9-12",
      guests: Number(selected.guests) || 1,
      assignedTo: selected.assignedTo || "None",
    });
  }, [selectedLessonId, lessons]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: name === "guests" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLessonId) {
      setStatus("Select a lesson to update.");
      return;
    }

    setStatus("Updating lesson...");

    try {
      const updatedLesson = await adminLib.lessonUpdate(selectedLessonId, formData);

      setLessons((previousLessons) =>
        previousLessons.map((lesson: Lesson) =>
          lesson._id === selectedLessonId ? updatedLesson : lesson
        )
      );

      setStatus("Lesson updated successfully.");
    } catch (error) {
      console.error("Failed to update lesson:", error);
      setStatus("Failed to update lesson.");
    }
  };

  return (
    <main className="update-lesson">
      <h1 className="update-lesson__header">Update Lesson</h1>

      <div
        className={`update-lesson__status${
          isErrorStatus
            ? " update-lesson__status--error"
            : isSuccessStatus
              ? " update-lesson__status--success"
              : ""
        }`}
        aria-live="polite"
      >
        {status}
      </div>

      {lessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        <form className="update-lesson__form" onSubmit={handleSubmit}>
          <label htmlFor="lesson-select">Select lesson</label>
          <select
            id="lesson-select"
            name="lessonId"
            value={selectedLessonId}
            onChange={(event) => setSelectedLessonId(event.target.value)}
            required
          >
            {lessons.map((lesson: Lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {buildLessonLabel(lesson, userLookup)}
              </option>
            ))}
          </select>

          <label htmlFor="type">Lesson Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
            <option value="expert">expert</option>
          </select>

          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label htmlFor="timeLength">Length (Hours)</label>
          <select
            id="timeLength"
            name="timeLength"
            value={formData.timeLength}
            onChange={handleChange}
            required
          >
            <option value="9-12">9-12</option>
            <option value="1-4">1-4</option>
            <option value="9-4">9-4</option>
          </select>

          <label htmlFor="guests">Number of Guests</label>
          <input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={12}
            value={formData.guests}
            onChange={handleChange}
            required
          />

          <label htmlFor="assignedTo">Assigned Instructor</label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
          >
            <option value="None">None</option>
            {users.map((user: User) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>

          <button type="submit">Update Lesson</button>
        </form>
      )}

      <Link to="/admin-home" className="update-lesson__link">
        Back
      </Link>
    </main>
  );
}

export default UpdateLesson;
