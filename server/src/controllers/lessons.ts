import type { Request, Response } from "express";
import * as services from "../services/index.js";
import * as utilities from "../utilities/index.js";
import { getErrorStatus, getRecord } from "../utilities/type-guards.js";

function getRouteParam(value: string | string[] | undefined, paramName: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing or invalid ${paramName}`);
  }

  return value;
}

export async function manageCreateLesson(req: Request, res: Response): Promise<void> {
  try {
    const lessonData = { ...(getRecord(req.body?.lessonData) ?? {}) };
    const createdLesson = await services.createLesson(lessonData);
    res.status(201).json({
      message: "Lesson created successfully",
      lesson: createdLesson,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to create lesson", error);
  }
}

export async function manageUpdateLesson(req: Request, res: Response): Promise<void> {
  try {
    const lessonId = getRouteParam(req.params.lessonId, "lessonId");
    const lessonData = { ...(getRecord(req.body?.lessonData) ?? {}) };
    const updatedLesson = await services.updateLesson(lessonId, lessonData);

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson: updatedLesson,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to update lesson", error);
  }
}

/**
 * Retrieves lessons by assignedTo query mode: None, all, explicit userId, or current user.
 */
export async function manageLessonRetrieval(req: Request, res: Response): Promise<void> {
  try {
    const assignedToParam = typeof req.query.assignedTo === "string" ? req.query.assignedTo : undefined;
    const currentUserId = req.user?.userId;

    let lessons;
    if (assignedToParam === "None") {
      lessons = await services.retrieveLessons({ assignedTo: null });
    } else if (assignedToParam === "all") {
      lessons = await services.retrieveLessons({});
    } else if (assignedToParam) {
      lessons = await services.retrieveLessons({ assignedTo: assignedToParam });
    } else if (currentUserId) {
      lessons = await services.retrieveLessons({ assignedTo: currentUserId });
    } else {
      lessons = await services.retrieveLessons({});
    }

    res.status(200).json({
      message:
        assignedToParam === "None"
          ? "Lessons with assignedTo=None retrieved"
          : assignedToParam === "all"
            ? "All lessons retrieved"
            : assignedToParam
              ? `Lessons retrieved for assignedTo=${assignedToParam}`
              : `Lessons retrieved for user ID ${currentUserId}`,
      lessons,
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve lessons", error);
  }
}

export async function manageSwitchLessonAssignment(req: Request, res: Response): Promise<void> {
  try {
    const lessonId = getRouteParam(req.params.lessonId, "lessonId");
    const newUserId = req.user?.userId ?? null;
    const updatedLesson = await services.switchLessonAssignment(lessonId, newUserId);

    res.status(200).json({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to switch lesson assignment", error);
  }
}

export async function manageRemoveLesson(req: Request, res: Response): Promise<void> {
  try {
    const lessonId = getRouteParam(req.params.lessonId, "lessonId");
    const result = await services.removeLesson(lessonId);
    res.status(200).json(result);
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to remove lesson", error);
  }
}
