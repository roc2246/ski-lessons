import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function manageCreateLesson(req, res) {
  try {
    const lessonData = { ...req.body.lessonData };
    const createdLesson = await models.createLesson(lessonData);
    res.status(201).json({
      message: "Lesson created successfully",
      lesson: createdLesson,
    });
  } catch (error) {
    utilities.sendError(res, 422, "Failed to create lesson", error);
  }
}

export async function manageLessonRetrieval(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const availableHeader = req.headers.available;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    let decoded;
    try {
      const token = authHeader.split(" ")[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.sendError(res, 401, `Unauthorized: Invalid token - ${err.message}`);
    }

    const userId = decoded.userId;

    // ✅ Explicit boolean parsing
    const availableOnly = availableHeader === "true";

    // ✅ Clear query logic
    const query = availableOnly
      ? { assignedTo: "None" }
      : { assignedTo: userId };

    const lessons = await models.retrieveLessons(query);

    return res.status(200).json({
      message: availableOnly
        ? "Available lessons retrieved"
        : `Lessons retrieved for user ID ${userId}`,
      lessons,
    });
  } catch (error) {
    return utilities.sendError(res, 400, "Failed to retrieve lessons", error);
  }
}


export async function manageSwitchLessonAssignment(req, res) {
  try {
    const { lessonId } = req.params;
    if (!lessonId) {
      return utilities.sendError(res, 400, "Missing lessonId in request parameters");
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.sendError(res, 401, `Unauthorized: Invalid token - ${err.message}`);
    }

    const newUserId = decoded.userId;
    const updatedLesson = await models.switchLessonAssignment(lessonId, newUserId);

    res.status(200).json({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  } catch (error) {
    utilities.sendError(res, 400, "Failed to switch lesson assignment", error);
  }
}
