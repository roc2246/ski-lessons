import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ===== MOCKS MUST COME FIRST =====
vi.mock("../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");

  // Mock constructor for models
  const constructorSpy = vi.fn(function (data) {
    Object.assign(this, data);
    this.save = vi.fn(() => Promise.resolve());
    return this;
  });

  constructorSpy.find = vi.fn((param) => {
    if (param.assignedTo) {
      if (typeof param.assignedTo === "string") {
        return Promise.resolve([{ lesson: "lesson" }]);
      } else {
        throw new Error("ID must be a string");
      }
    }
    return Promise.resolve([]);
  });

  constructorSpy.findByIdAndUpdate = vi.fn((id, update) => {
    if (id === "validLessonId")
      return Promise.resolve({ _id: id, assignedTo: update.assignedTo });
    return Promise.resolve(null);
  });

  constructorSpy.findByIdAndDelete = vi.fn((id) => {
    if (id === "validLessonId")
      return Promise.resolve({ _id: id, title: "Test Lesson" });
    return Promise.resolve(null);
  });

  return {
    ...actual,
    getModel: vi.fn(() => constructorSpy),
    TokenBlacklist: actual.TokenBlacklist,
  };
});

import * as models from ".";
import { errorEmail } from "../email";

// ===== TESTS =====

describe("createLesson", () => {
  it("creates a lesson", async () => {
    const lessonInput = {
      type: "private",
      date: "2025-12-01",
      timeLength: "2 hours",
      guests: 2,
      assignedTo: "user123",
    };
    const result = await models.createLesson(lessonInput);
    expect(result.save).toHaveBeenCalled();
  });

  it("throws if required field missing", async () => {
    await expect(
      models.createLesson({
        type: "group",
        date: undefined,
        timeLength: "1 hour",
        guests: 4,
        assignedTo: "abc",
      })
    ).rejects.toThrow("Date required");

    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("retrieveLessons", () => {
  it("returns lessons for valid ID", async () => {
    const results = await models.retrieveLessons({ assignedTo: "2" });
    expect(results).toEqual([{ lesson: "lesson" }]);
  });

  it("throws if param not object", async () => {
    await expect(models.retrieveLessons("FAIL")).rejects.toThrow(
      "Param must be a object"
    );
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("switchLessonAssignment", () => {
  it("switches assigned instructor", async () => {
    const lesson = await models.switchLessonAssignment(
      "validLessonId",
      "newUser123"
    );
    expect(lesson.assignedTo).toBe("newUser123");
  });

  it("throws if lesson not found", async () => {
    await expect(
      models.switchLessonAssignment("badId", "newUser")
    ).rejects.toThrow("Lesson not found");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("removeLesson", () => {
  it("deletes lesson successfully", async () => {
    const result = await models.removeLesson("validLessonId");
    expect(result.success).toBe(true);
    expect(result.lesson._id).toBe("validLessonId");
  });

  it("throws if lesson not found", async () => {
    await expect(models.removeLesson("notFound")).rejects.toThrow(
      "Lesson not found or already deleted"
    );
    expect(errorEmail).toHaveBeenCalled();
  });
});
