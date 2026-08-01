// @vitest-environment jsdom

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import CalendarDate from "../CalendarDate";
import type { Lesson } from "../../../types/domain";

vi.mock("../../Lesson", () => ({
  default: ({ lesson }: { lesson: Lesson }) => <div>{lesson.type}</div>,
}));

const lesson: Lesson = {
  _id: "lesson-1",
  type: "beginner",
  date: "2026-08-01",
  timeLength: "9-12",
  guests: 2,
  assignedTo: null,
};

describe("CalendarDate accessibility behavior", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(<CalendarDate day={new Date("2026-08-01")} lessons={[lesson]} />);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("opens dialog on Enter and exposes dialog semantics", () => {
    const dateCell = container.querySelector(".calendar__date") as HTMLDivElement;

    act(() => {
      dateCell.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
    });

    const dialog = container.querySelector("[role='dialog']") as HTMLDivElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const title = labelledBy
      ? container.querySelector(`#${labelledBy}`)
      : null;
    expect(title?.textContent).toContain("Lessons for");

    const closeButton = container.querySelector("button[aria-label='Close lesson details']");
    expect(closeButton).toBeTruthy();
  });

  it("opens on Space and closes on Escape", () => {
    const dateCell = container.querySelector(".calendar__date") as HTMLDivElement;

    act(() => {
      dateCell.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true })
      );
    });

    let dialog = container.querySelector("[role='dialog']") as HTMLDivElement;
    expect(dialog).toBeTruthy();

    act(() => {
      dialog.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    dialog = container.querySelector("[role='dialog']") as HTMLDivElement;
    expect(dialog).toBeFalsy();
  });
});
