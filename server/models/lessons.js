import * as utilities from "../utilities/index.js";
import { errorEmail } from "../email/index.js";

const CONFLICTING_TIME_LENGTHS = {
  "9-12": ["9-12", "9-4"],
  "1-4": ["1-4", "9-4"],
  "9-4": ["9-12", "1-4", "9-4"],
};

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getDateKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

async function notifyIfServerError(subject, error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  if (status >= 500) {
    await errorEmail(subject, error.toString());
  }
}

// ---------- CREATE LESSON ----------
export async function createLesson(lessonData) {
  try {
    const requiredFields = ["type", "date", "timeLength", "guests"];

    utilities.argValidation(
      requiredFields.map((f) => lessonData[f]),
      requiredFields.map((f) => f[0].toUpperCase() + f.slice(1))
    );

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    const assignedTo = lessonData.assignedTo ?? null;

    if (assignedTo !== null) {
      const exists = await Lesson.exists({
        date: lessonData.date,
        assignedTo: assignedTo,
        timeLength: {
          $in: CONFLICTING_TIME_LENGTHS[lessonData.timeLength],
        },
      });

      const errorMssg = `This instructor is already booked on ${lessonData.date} during ${lessonData.timeLength}.`;

      if (exists) {
        throw createHttpError(errorMssg, 409);
      }
    }

    const newLesson = new Lesson({
      ...lessonData,
      assignedTo, // Use converted value
      date: new Date(lessonData.date), // Convert to Date object
    });
    await newLesson.save();

    return newLesson;
  } catch (error) {
    await notifyIfServerError("Failed to create lesson", error);
    throw error;
  }
}

// ---------- RETRIEVE LESSONS ----------
export async function retrieveLessons(param, limit = 50, skip = 0) {
  try {
    utilities.argValidation([param], ["Param"]);
    utilities.dataTypeValidation([param], ["Param"], ["object"]);

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    return await Lesson.find(param).limit(limit).skip(skip).lean();
  } catch (error) {
    await notifyIfServerError("Failed to retrieve lessons", error);
    throw error;
  }
}

// ---------- RETRIEVE NON-CONFLICTING AVAILABLE LESSONS ----------
export async function retrieveAvailableLessonsForUser(userId, limit = 50, skip = 0) {
  try {
    const [availableLessons, userLessons] = await Promise.all([
      retrieveLessons({ assignedTo: null }, limit, skip),
      retrieveLessons({ assignedTo: userId }),
    ]);

    return availableLessons.filter((lesson) => {
      const lessonDateKey = getDateKey(lesson.date);
      if (!lessonDateKey) return false;

      return !userLessons.some((userLesson) => {
        const userLessonDateKey = getDateKey(userLesson.date);
        if (!userLessonDateKey || userLessonDateKey !== lessonDateKey) {
          return false;
        }

        const conflicts = CONFLICTING_TIME_LENGTHS[lesson.timeLength] || [];
        return conflicts.includes(userLesson.timeLength);
      });
    });
  } catch (error) {
    await notifyIfServerError("Failed to retrieve available lessons", error);
    throw error;
  }
}

// ---------- RETRIEVE USERS ----------
export async function retrieveUsers() {
  try {
    const User = utilities.getModel(utilities.UserSchema, "User");
    return await User.find({}).select("-password").lean();
  } catch (error) {
    await notifyIfServerError("Failed to retrieve users", error);
    throw error;
  }
}

// ---------- SWITCH LESSON ASSIGNMENT ----------
export async function switchLessonAssignment(id, newUserId) {
  try {
    utilities.argValidation([id], ["Lesson ID"]);
    utilities.dataTypeValidation([id], ["ID"], ["string"]);

    if (newUserId !== null && typeof newUserId !== "string") {
      throw createHttpError("New User ID must be a string or null", 400);
    }

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    const lessonToAssign = await Lesson.findById(id).lean();

    if (!lessonToAssign) {
      throw createHttpError("Lesson not found", 404);
    }

    if (newUserId !== null) {
      const conflictingLesson = await Lesson.findOne({
        _id: { $ne: id },
        assignedTo: newUserId,
        date: lessonToAssign.date,
        timeLength: {
          $in: CONFLICTING_TIME_LENGTHS[lessonToAssign.timeLength],
        },
      });

      if (conflictingLesson) {
        throw createHttpError(
          `User is already assigned to a lesson on ${lessonToAssign.date} during ${lessonToAssign.timeLength}`,
          409
        );
      }
    }

    const updated = await Lesson.findOneAndUpdate(
      { _id: id, assignedTo: null },
      { $set: { assignedTo: newUserId } },
      { new: true }
    );

    if (!updated) {
      throw createHttpError("Lesson already assigned", 409);
    }

    return updated;
  } catch (error) {
    await notifyIfServerError("Failed to switch lesson assignment", error);
    throw error;
  }
}

// ---------- UNASSIGN ALL LESSONS ----------
export async function unassignAllLessons(userId) {
  try {
    utilities.argValidation([userId], ["User ID"]);
    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");
    await Lesson.updateMany({ assignedTo: userId }, { assignedTo: null });
  } catch (error) {
    await notifyIfServerError("Failed to unassign lessons", error);
    throw error;
  }
}

// ---------- REMOVE LESSON ----------
export async function removeLesson(id) {
  try {
    utilities.argValidation([id], ["Lesson ID"]);
    utilities.dataTypeValidation([id], ["ID"], ["string"]);

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    const deleted = await Lesson.findByIdAndDelete(id);
    if (!deleted) throw createHttpError("Lesson not found or already deleted", 404);

    return {
      success: true,
      message: "Lesson successfully removed",
      lesson: deleted,
    };
  } catch (error) {
    await notifyIfServerError("Failed to remove lesson", error);
    throw error;
  }
}
