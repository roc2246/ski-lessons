import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../utilities/index.js")>("../../utilities/index.js");

  const constructorSpy: any = vi.fn(function (this: any, data: Record<string, unknown>) {
    Object.assign(this, data);
    this.save = vi.fn(() => Promise.resolve());
    return this;
  });

  constructorSpy.exists = vi.fn().mockResolvedValue(false);

  constructorSpy.find = vi.fn((param: Record<string, unknown>) => {
    let result: unknown[];
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

  constructorSpy.findById = vi.fn((id: string) => {
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

  constructorSpy.findOneAndUpdate = vi.fn((query: Record<string, unknown>, update: Record<string, unknown>, options: unknown) => {
    if (query._id === "validLessonId") {
      return Promise.resolve({
        _id: query._id,
        assignedTo: (update as any).$set.assignedTo,
        ...(options as Record<string, unknown>),
      });
    }

    return Promise.resolve(null);
  });

  constructorSpy.findByIdAndUpdate = vi.fn((id: string, update: Record<string, unknown>) => {
    if (id === "validLessonId") {
      return Promise.resolve({ _id: id, ...update });
    }

    return Promise.resolve(null);
  });

  constructorSpy.findByIdAndDelete = vi.fn((id: string) => {
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

import * as services from "../index.js";
import { errorEmail } from "../../email/index.js";
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

    const result = await services.createLesson(lessonInput);
    expect(result.save).toHaveBeenCalled();
  });

  it("preserves the selected lesson date as a date-only string", async () => {
    const lessonInput = {
      type: "private",
      date: "2025-12-01",
      timeLength: "2 hours",
      guests: 2,
      assignedTo: "user123",
    };

    const result = await services.createLesson(lessonInput);

    expect(result.date).toBe("2025-12-01");
  });

  it("keeps the original calendar day when given an ISO timestamp", async () => {
    const lessonInput = {
      type: "private",
      date: "2026-08-01T20:00:00-04:00",
      timeLength: "2 hours",
      guests: 2,
      assignedTo: "user123",
    };

    const result = await services.createLesson(lessonInput);

    expect(result.date).toBe("2026-08-01");
  });

  it("throws if required field missing", async () => {
    await expect(
      services.createLesson({
        type: "group",
        date: undefined,
        timeLength: "1 hour",
        guests: 4,
        assignedTo: "abc",
      })
    ).rejects.toThrow(/Required fields missing: Date/);
  });

  it("allows multiple unassigned lessons for the same date and time", async () => {
    const Lesson = utilities.getModel({} as any, "Lesson");
    (Lesson.exists as any).mockResolvedValueOnce(false);

    await expect(
      services.createLesson({
        type: "beginner",
        date: "2025-12-01",
        timeLength: "9-12",
        guests: 2,
        assignedTo: null,
      })
    ).resolves.toBeDefined();
  });
});

describe("retrieveLessons", () => {
  it("returns lessons for valid ID", async () => {
    const results = await services.retrieveLessons({ assignedTo: "2" });
    expect(results).toEqual([{ lesson: "lesson" }]);
  });
});

describe("switchLessonAssignment", () => {
  it("switches assigned instructor", async () => {
    const lesson = await services.switchLessonAssignment("validLessonId", "newUser123");
    expect(lesson.assignedTo).toBe("newUser123");
  });

  it("throws if lesson not found", async () => {
    await expect(services.switchLessonAssignment("badId", "newUser")).rejects.toThrow("Lesson not found");
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

    const result = await services.updateLesson("validLessonId", updateInput);

    expect(result._id).toBe("validLessonId");
    expect(result.type).toBe("intermediate");
    expect(result.timeLength).toBe("1-4");
    expect(result.guests).toBe(4);
    expect(result.assignedTo).toBe("newUser123");
  });

  it("preserves the selected date when updating a lesson", async () => {
    const result = await services.updateLesson("validLessonId", {
      type: "advanced",
      date: "2025-12-03",
      timeLength: "9-12",
      guests: 2,
      assignedTo: null,
    });

    expect(result.date).toBe("2025-12-03");
  });

  it("throws if lesson to update is not found", async () => {
    await expect(
      services.updateLesson("missingLessonId", {
        type: "beginner",
        date: "2025-12-03",
        timeLength: "9-12",
        guests: 2,
        assignedTo: null,
      })
    ).rejects.toThrow("Lesson not found");
  });

  it("throws conflict when instructor is already booked", async () => {
    const Lesson = utilities.getModel({} as any, "Lesson");
    (Lesson.findOne as any).mockResolvedValueOnce({ _id: "conflictLesson" });

    await expect(
      services.updateLesson("validLessonId", {
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
    const result = await services.removeLesson("validLessonId");
    expect(result.success).toBe(true);
    expect(result.lesson._id).toBe("validLessonId");
  });

  it("throws if lesson not found", async () => {
    await expect(services.removeLesson("notFound")).rejects.toThrow("Lesson not found or already deleted");
    expect(errorEmail).not.toHaveBeenCalled();
  });
});
