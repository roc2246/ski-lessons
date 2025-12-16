import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controllers from "../controllers/lessons.js";
import jwt from "jsonwebtoken";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createReq = (body = {}, headers = {}, params = {}) => ({ body, headers, params });

vi.mock("jsonwebtoken", () => ({ default: { sign: vi.fn(), verify: vi.fn() } }));
vi.mock("../models/index.js", async () => {
  const actual = await vi.importActual("../models/index.js");
  return { ...actual, createLesson: vi.fn(), retrieveLessons: vi.fn(), switchLessonAssignment: vi.fn() };
});
vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return { ...actual, sendError: vi.fn() };
});

beforeEach(() => vi.clearAllMocks());

// ========== manageCreateLesson ==========
describe("manageCreateLesson", () => {
  it("should create a lesson successfully", async () => {
    const req = createReq({ lessonData: { type: "Beginner" } });
    const res = createRes();
    const lesson = { _id: "1", ...req.body.lessonData };
    models.createLesson.mockResolvedValueOnce(lesson);

    await controllers.manageCreateLesson(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Lesson created successfully", lesson });
  });
});

// ========== manageLessonRetrieval ==========
describe("manageLessonRetrieval", () => {
  it("should retrieve lessons successfully", async () => {
    const fakeUserId = "uid123";
    jwt.verify.mockReturnValueOnce({ userId: fakeUserId });
    const lessons = [{ _id: "l1" }];
    models.retrieveLessons.mockResolvedValueOnce(lessons);

    const req = createReq({}, { authorization: "Bearer faketoken" });
    const res = createRes();

    await controllers.manageLessonRetrieval(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: `Lessons retrieved for user ID ${fakeUserId}`, lessons });
  });
});

// ========== manageSwitchLessonAssignment ==========
describe("manageSwitchLessonAssignment", () => {
  it("should switch lesson assignment successfully", async () => {
    const req = createReq({}, { authorization: "Bearer faketoken" }, { lessonId: "123" });
    const res = createRes();
    jwt.verify.mockReturnValueOnce({ userId: "uid123" });
    const updatedLesson = { _id: "123", assignedTo: "uid123" };
    models.switchLessonAssignment.mockResolvedValueOnce(updatedLesson);

    await controllers.manageSwitchLessonAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Lesson assignment updated", lesson: updatedLesson });
  });
});
