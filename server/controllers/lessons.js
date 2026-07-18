import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageCreateLesson(req, res) {
  try {
    const lessonData = { ...req.body.lessonData };
    const createdLesson = await models.createLesson(lessonData);
    res.status(201).json({
      message: "Lesson created successfully",
      lesson: createdLesson,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    utilities.sendError(res, status, "Failed to create lesson", error);
  }
}

export async function manageLessonRetrieval(req, res) {
  try {
    // req.user is attached by authenticate middleware
    const assignedToParam = req.query.assignedTo;

    let lessons;
    if (assignedToParam === "None") {
      lessons = await models.retrieveLessons({ assignedTo: null });
    } else if (assignedToParam === "all") {
      lessons = await models.retrieveLessons({});
    } else if (assignedToParam) {
      lessons = await models.retrieveLessons({ assignedTo: assignedToParam });
    } else {
      lessons = await models.retrieveLessons({ assignedTo: req.user.userId });
    }

    return res.status(200).json({
      message: assignedToParam === "None"
        ? "Lessons with assignedTo=None retrieved"
        : assignedToParam === "all"
          ? "All lessons retrieved"
          : assignedToParam
            ? `Lessons retrieved for assignedTo=${assignedToParam}`
            : `Lessons retrieved for user ID ${req.user.userId}`,
      lessons,
    });
  } catch (error) {
    return utilities.sendError(res, 500, "Failed to retrieve lessons", error);
  }
}

export async function manageSwitchLessonAssignment(req, res) {
  try {
    const { lessonId } = req.params;
    const newUserId = req.user.userId;
    const updatedLesson = await models.switchLessonAssignment(lessonId, newUserId);

    res.status(200).json({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    utilities.sendError(res, status, "Failed to switch lesson assignment", error);
  }
}

export async function manageRemoveLesson(req, res) {
  try {
    const { lessonId } = req.params;
    const result = await models.removeLesson(lessonId);
    res.status(200).json(result);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    utilities.sendError(res, status, "Failed to remove lesson", error);
  }
}
