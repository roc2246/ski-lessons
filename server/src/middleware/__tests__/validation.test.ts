import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateCreateLessonRequest, validateUpdateLessonRequest } from "../validation.js";
import * as utilities from "../../utilities/index.js";

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../utilities/index.js")>("../../utilities/index.js");
  return {
    ...actual,
    sendError: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("validateUpdateLessonRequest", () => {
  it("normalizes a valid payload and calls next", () => {
    const req: any = {
      body: {
        lessonData: {
          type: " beginner ",
          date: "2026-01-10",
          timeLength: " 9-12 ",
          guests: "3",
          assignedTo: "",
        },
      },
    };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    const next = vi.fn();

    validateUpdateLessonRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.lessonData).toEqual({
      type: "beginner",
      date: "2026-01-10",
      timeLength: "9-12",
      guests: 3,
      assignedTo: null,
    });
  });

  it("fails when lessonData is missing", () => {
    const req: any = { body: {} };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    const next = vi.fn();

    validateUpdateLessonRequest(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(utilities.sendError).toHaveBeenCalled();
  });
});

describe("validateCreateLessonRequest", () => {
  it("rejects invalid lesson type", () => {
    const req: any = {
      body: {
        lessonData: {
          type: "invalid",
          date: "2026-01-10",
          timeLength: "9-12",
          guests: 2,
          assignedTo: null,
        },
      },
    };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    const next = vi.fn();

    validateCreateLessonRequest(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(utilities.sendError).toHaveBeenCalled();
  });
});
