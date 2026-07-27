import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual("../../utilities/index.js");

  const constructorSpy = vi.fn(function (data) {
    Object.assign(this, data);
    this.save = vi.fn(() => Promise.resolve());
    return this;
  });

  constructorSpy.exists = vi.fn().mockResolvedValue(false);

  constructorSpy.find = vi.fn((param) => {
    let result;
    if (param.assignedTo) {
      if (typeof param.assignedTo === "string") {
        result = [{ lesson: "lesson" }];
      } else {
        throw new Error("ID must be a string");
      }
    } else {
      result = [];
    }

    return {
      limit: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(result),
    };
  });

  constructorSpy.findById = vi.fn((id) => {
    if (id === "validLessonId") {
      return {
        lean: vi.fn().mockResolvedValue({
          _id: id,
          date: new Date("2025-12-01"),
          timeLength: "9-12",
          assignedTo: null,
        }),
      };
    }

    return {
      lean: vi.fn().mockResolvedValue(null),
    };
  });

  constructorSpy.findOne = vi.fn(() => Promise.resolve(null));

  constructorSpy.findOneAndUpdate = vi.fn((query, update, options) => {
    if (query._id === "validLessonId") {
      return Promise.resolve({
        _id: query._id,
        assignedTo: update.$set.assignedTo,
        ...options,
      });
    }

    return Promise.resolve(null);
  });

  constructorSpy.findByIdAndUpdate = vi.fn((id, update) => {
    if (id === "validLessonId") {
      return Promise.resolve({ _id: id, ...update });
    }

    return Promise.resolve(null);
  });

  constructorSpy.findByIdAndDelete = vi.fn((id) => {
    if (id === "validLessonId") {
      return Promise.resolve({ _id: id, title: "Test Lesson" });
    }

    return Promise.resolve(null);
  });

  return {
    ...actual,
    getModel: vi.fn(() => constructorSpy),
  };
});

import * as models from "..";
import { errorEmail } from "../../email";
import * as utilities from "../../utilities/index.js";

beforeEach(() => {
  vi.clearAllMocks();
});

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
    ).rejects.toThrow(/Required fields missing: Date/);
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
    expect(errorEmail).not.toHaveBeenCalled();
  });
});

describe("updateLesson", () => {
  it("updates lesson details successfully", async () => {
    const updateInput = {
      type: "intermediate",
      date: "2025-12-02",
      timeLength: "1-4",
      guests: 4,
      assignedTo: "newUser123",
    };

    const result = await models.updateLesson("validLessonId", updateInput);

    expect(result._id).toBe("validLessonId");
    expect(result.type).toBe("intermediate");
    expect(result.timeLength).toBe("1-4");
    expect(result.guests).toBe(4);
    expect(result.assignedTo).toBe("newUser123");
  });

  it("throws if lesson to update is not found", async () => {
    await expect(
      models.updateLesson("missingLessonId", {
        type: "beginner",
        date: "2025-12-03",
        timeLength: "9-12",
        guests: 2,
        assignedTo: null,
      })
    ).rejects.toThrow("Lesson not found");
  });

  it("throws conflict when instructor is already booked", async () => {
    const Lesson = utilities.getModel();
    Lesson.findOne.mockResolvedValueOnce({ _id: "conflictLesson" });

    await expect(
      models.updateLesson("validLessonId", {
        type: "advanced",
        date: "2025-12-01",
        timeLength: "9-12",
        guests: 2,
        assignedTo: "bookedUser123",
      })
    ).rejects.toThrow("already booked");
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
    expect(errorEmail).not.toHaveBeenCalled();
  });
});
