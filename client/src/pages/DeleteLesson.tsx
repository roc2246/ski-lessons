import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import * as adminLib from "../utils/admin-library";
import * as calendarLib from "../utils/calendar-library";
import type { Lesson, User } from "../types/domain";

function formatLessonDate(value: unknown) {
  if (value instanceof Date) {
    return `${value.getMonth() + 1}/${value.getDate()}/${value.getFullYear()}`;
  }

  const datePart = String(value ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return "";
  }

  const [year, month, day] = datePart.split("-");
  return `${month}/${day}/${year}`;
}

function DeleteLesson() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userLookup, setUserLookup] = useState<Record<string, string>>({});
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

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

        const lookup = Object.fromEntries(
          users.map((user: User) => [user._id, user.username])
        );

        setUserLookup(lookup);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }

    fetchLessons();
    fetchUsers();
  }, []);

  const handleDelete = async (lessonId: string) => {
    if (deletingLessonId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this lesson?"
    );

    if (!confirmed) return;

    setStatus("Deleting lesson...");
    setDeletingLessonId(lessonId);

    try {
      await adminLib.lessonDelete(lessonId);

      setLessons((previousLessons) =>
        previousLessons.filter((lesson) => lesson._id !== lessonId)
      );

      setStatus("Lesson deleted successfully.");
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setStatus("Failed to delete lesson.");
    } finally {
      setDeletingLessonId(null);
    }
  };

  const filteredLessons = lessons.filter((lesson: Lesson) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return true;

    const assignedToLabel = lesson.assignedTo
      ? userLookup[lesson.assignedTo] || lesson.assignedTo
      : "Unassigned";

    const searchableText = `
      ${lesson.type || ""}
      ${formatLessonDate(lesson.date)}
      ${lesson.timeLength || ""}
      ${assignedToLabel}
    `.toLowerCase();

    return searchableText.includes(query);
  });

  return (
    <main className="delete-lessons">
      <section className="delete-lessons__panel">
        <header className="delete-lessons__header">
          <span className="delete-lessons__eyebrow">Administration</span>

          <h1 className="delete-lessons__title">Delete Lessons</h1>

          <p className="delete-lessons__description">
            Search the lesson schedule and permanently remove lessons that are
            no longer needed.
          </p>
        </header>

        <div className="delete-lessons__toolbar">
          <label
            className="delete-lessons__search-label"
            htmlFor="lesson-search"
          >
            Search lessons
          </label>

          <input
            id="lesson-search"
            className="delete-lessons__search"
            type="search"
            value={searchTerm}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
            placeholder="Search by type, date, time, or instructor"
          />

          <span className="delete-lessons__count">
            {filteredLessons.length}{" "}
            {filteredLessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>

        {status && (
          <p
            className={`delete-lessons__status${
              status.includes("Failed") ? " delete-lessons__status--error" : ""
            }`}
            role="status"
          >
            {status}
          </p>
        )}

        <div className="delete-lessons__list">
          {filteredLessons.length === 0 ? (
            <div className="delete-lessons__empty">
              <h2>No lessons found</h2>

              <p>
                Try changing your search or return to the administration
                dashboard.
              </p>
            </div>
          ) : (
            filteredLessons.map((lesson: Lesson) => {
              const assignedToLabel = lesson.assignedTo
                ? userLookup[lesson.assignedTo] || lesson.assignedTo
                : "Unassigned";

              return (
                <article
                  key={lesson._id}
                  className="delete-lessons__item"
                >
                  <div className="delete-lessons__details">
                    <span className="delete-lessons__type">
                      {lesson.type || "Lesson"}
                    </span>

                    <div className="delete-lessons__metadata">
                      <span>
                        <strong>Date:</strong>{" "}
                        {formatLessonDate(lesson.date)}
                      </span>

                      <span>
                        <strong>Time:</strong> {lesson.timeLength}
                      </span>

                      <span>
                        <strong>Instructor:</strong> {assignedToLabel}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="delete-lessons__delete"
                    onClick={() => handleDelete(lesson._id)}
                    aria-label={`Delete ${lesson.type || "lesson"} on ${formatLessonDate(lesson.date)}`}
                    disabled={deletingLessonId !== null}
                    aria-busy={deletingLessonId === lesson._id}
                  >
                    {deletingLessonId === lesson._id ? "Deleting..." : "Delete"}
                  </button>
                </article>
              );
            })
          )}
        </div>

        <footer className="delete-lessons__footer">
          <Link to="/admin-home" className="delete-lessons__back-link">
            ← Back to Admin Home
          </Link>
        </footer>
      </section>
    </main>
  );
}

export default DeleteLesson;