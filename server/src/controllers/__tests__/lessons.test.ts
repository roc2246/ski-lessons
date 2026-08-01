import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../models/index.js")>("../../models/index.js");
  return {
    ...actual,
    createLesson: vi.fn(),
    updateLesson: vi.fn(),
    retrieveLessons: vi.fn(),
    switchLessonAssignment: vi.fn(),
    removeLesson: vi.fn(),
  };
});

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../utilities/index.js")>("../../utilities/index.js");
  return { ...actual, sendError: vi.fn() };
});

import * as controllers from "../lessons.js";
import * as models from "../../models/index.js";
import * as utilities from "../../utilities/index.js";

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createReq = (body: Record<string, unknown> = {}, params: Record<string, string> = {}) => ({ body, params });

beforeEach(() => vi.clearAllMocks());

describe("manageCreateLesson", () => {
  it("creates a lesson successfully", async () => {
    const req = createReq({ lessonData: { type: "Beginner" } });
    const res = createRes();
    const lesson = { _id: "1", ...(req.body.lessonData as Record<string, unknown>) };
    (models.createLesson as any).mockResolvedValueOnce(lesson);

    await controllers.manageCreateLesson(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Lesson created successfully", lesson });
  });
});

describe("manageUpdateLesson", () => {
  it("updates a lesson successfully", async () => {
    const req = createReq(
      { lessonData: { type: "beginner", date: "2026-01-10", timeLength: "9-12", guests: 3, assignedTo: null } },
      { lessonId: "lesson123" }
    );
    const res = createRes();
    const lesson = { _id: "lesson123", ...(req.body.lessonData as Record<string, unknown>) };
    (models.updateLesson as any).mockResolvedValueOnce(lesson);

    await controllers.manageUpdateLesson(req as any, res as any);

    expect(models.updateLesson).toHaveBeenCalledWith("lesson123", req.body.lessonData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Lesson updated successfully", lesson });
  });

  it("delegates model errors with the status code", async () => {
    const req = createReq(
      { lessonData: { type: "beginner", date: "2026-01-10", timeLength: "9-12", guests: 3, assignedTo: null } },
      { lessonId: "lesson123" }
    );
    const res = createRes();
    const modelError = Object.assign(new Error("conflict"), { status: 409 });
    (models.updateLesson as any).mockRejectedValueOnce(modelError);

    await controllers.manageUpdateLesson(req as any, res as any);

    expect(utilities.sendError).toHaveBeenCalledWith(res, 409, "Failed to update lesson", modelError);
  });
});

describe("manageLessonRetrieval", () => {
  it("retrieves lessons for the current user", async () => {
    const lessons = [{ _id: "l1" }];
    (models.retrieveLessons as any).mockResolvedValueOnce(lessons);
    const req: any = { user: { userId: "uid123" }, query: {} };
    const res = createRes();

    await controllers.manageLessonRetrieval(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Lessons retrieved for user ID uid123", lessons });
  });

  it("retrieves all unassigned lessons when assignedTo=None", async () => {
    const lessons = [{ _id: "l2", assignedTo: null }];
    (models.retrieveLessons as any).mockResolvedValueOnce(lessons);
    const req: any = { user: { userId: "uid123" }, query: { assignedTo: "None" } };
    const res = createRes();

    await controllers.manageLessonRetrieval(req, res);

    expect(models.retrieveLessons).toHaveBeenCalledWith({ assignedTo: null });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lessons with assignedTo=None retrieved",
      lessons,
    });
  });
});

describe("manageSwitchLessonAssignment", () => {
  it("switches the lesson to the current user", async () => {
    const req: any = { params: { lessonId: "123" }, user: { userId: "uid123" } };
    const res = createRes();
    const updatedLesson = { _id: "123", assignedTo: "uid123" };
    (models.switchLessonAssignment as any).mockResolvedValueOnce(updatedLesson);

    await controllers.manageSwitchLessonAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Lesson assignment updated", lesson: updatedLesson });
  });
});

describe("manageRemoveLesson", () => {
  it("removes a lesson successfully", async () => {
    const req: any = { params: { lessonId: "123" } };
    const res = createRes();
    const result = { success: true, message: "Lesson successfully removed" };
    (models.removeLesson as any).mockResolvedValueOnce(result);

    await controllers.manageRemoveLesson(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
