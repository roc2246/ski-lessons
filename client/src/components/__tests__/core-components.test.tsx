import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CreateLessonField from "../CreateLessonField";
import Field from "../Field";
import InstructorControlls from "../InstructorControlls";
import Lesson from "../Lesson";
import LessonBoardControlls from "../LessonBoardControlls";
import type { Lesson as LessonType } from "../../types/domain";

describe("core components", () => {
  it("renders CreateLessonField select options", () => {
    const html = renderToStaticMarkup(
      <CreateLessonField
        label="Type"
        type="select"
        name="type"
        value="beginner"
        onChange={() => {}}
        options={[
          { value: "beginner", label: "Beginner" },
          { value: "advanced", label: "Advanced" },
        ]}
      />
    );

    expect(html).toContain("<select");
    expect(html).toContain("Beginner");
    expect(html).toContain("Advanced");
  });

  it("renders Field checkbox label as Admin", () => {
    const html = renderToStaticMarkup(
      <Field type="checkbox" value={false} onChange={() => {}} />
    );

    expect(html).toContain("Admin");
    expect(html).toContain("type=\"checkbox\"");
  });

  it("renders InstructorControlls admin links when admin is true", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <InstructorControlls admin={true} />
      </MemoryRouter>
    );

    expect(html).toContain("Logout");
    expect(html).toContain("Lesson Board");
    expect(html).toContain("Admin");
  });

  it("does not render Admin link for non-admin users", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <InstructorControlls admin={false} />
      </MemoryRouter>
    );

    expect(html).toContain("Lesson Board");
    expect(html).not.toContain("/admin-home");
  });

  it("renders Lesson details and add button when unassigned", () => {
    const lesson: LessonType = {
      _id: "lesson-1",
      type: "beginner",
      date: "2026-01-10",
      timeLength: "9-12",
      guests: 3,
      assignedTo: null,
    };

    const html = renderToStaticMarkup(<Lesson lesson={lesson} />);

    expect(html).toContain("beginner");
    expect(html).toContain("3 guests");
    expect(html).toContain("Add Lesson");
  });

  it("renders LessonBoardControlls links", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LessonBoardControlls />
      </MemoryRouter>
    );

    expect(html).toContain("Logout");
    expect(html).toContain("Back");
  });
});
