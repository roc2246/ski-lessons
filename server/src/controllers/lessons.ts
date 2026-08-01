import type { Request, Response } from "express";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";
import { getErrorStatus, getRecord } from "../utilities/type-guards.js";

function getRouteParam(value: string | string[] | undefined, paramName: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing or invalid ${paramName}`);
  }

  return value;
}

export async function manageCreateLesson(req: Request, res: Response) {
  try {
    const lessonData = { ...(getRecord(req.body?.lessonData) ?? {}) };
    const createdLesson = await models.createLesson(lessonData);
    res.status(201).json({
      message: "Lesson created successfully",
      lesson: createdLesson,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to create lesson", error);
  }
}

export async function manageUpdateLesson(req: Request, res: Response) {
  try {
    const lessonId = getRouteParam(req.params.lessonId, "lessonId");
    const lessonData = { ...(getRecord(req.body?.lessonData) ?? {}) };
    const updatedLesson = await models.updateLesson(lessonId, lessonData);

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson: updatedLesson,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to update lesson", error);
  }
}

export async function manageLessonRetrieval(req: Request, res: Response) {
  try {
    const assignedToParam = typeof req.query.assignedTo === "string" ? req.query.assignedTo : undefined;

    let lessons;
    if (assignedToParam === "None") {
      lessons = await models.retrieveLessons({ assignedTo: null });
    } else if (assignedToParam === "all") {
      lessons = await models.retrieveLessons({});
    } else if (assignedToParam) {
      lessons = await models.retrieveLessons({ assignedTo: assignedToParam });
    } else {
      lessons = await models.retrieveLessons({ assignedTo: req.user?.userId });
    }

    return res.status(200).json({
      message:
        assignedToParam === "None"
          ? "Lessons with assignedTo=None retrieved"
          : assignedToParam === "all"
            ? "All lessons retrieved"
            : assignedToParam
              ? `Lessons retrieved for assignedTo=${assignedToParam}`
              : `Lessons retrieved for user ID ${req.user?.userId}`,
      lessons,
    });
  } catch (error) {
    return utilities.sendError(res, 500, "Failed to retrieve lessons", error);
  }
}

export async function manageSwitchLessonAssignment(req: Request, res: Response) {
  try {
    const lessonId = getRouteParam(req.params.lessonId, "lessonId");
    const newUserId = req.user?.userId ?? null;
    const updatedLesson = await models.switchLessonAssignment(lessonId, newUserId);

    res.status(200).json({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to switch lesson assignment", error);
  }
}

export async function manageRemoveLesson(req: Request, res: Response) {
  try {
    const lessonId = getRouteParam(req.params.lessonId, "lessonId");
    const result = await models.removeLesson(lessonId);
    res.status(200).json(result);
  } catch (error) {
    const status = getErrorStatus(error);
    utilities.sendError(res, status ?? 500, "Failed to remove lesson", error);
  }
}
