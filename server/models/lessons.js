import * as utilities from "../utilities/index.js";
import { errorEmail } from "../email/index.js";

// ---------- CREATE LESSON ----------
export async function createLesson(lessonData) {
  try {
    const requiredFields = [
      "type",
      "date",
      "timeLength",
      "guests",
      "assignedTo",
    ];

    utilities.argValidation(
      requiredFields.map((f) => lessonData[f]),
      requiredFields.map((f) => f[0].toUpperCase() + f.slice(1))
    );

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    const conflictingTimeLengths = {
      "9-12": ["9-12", "9-4"],
      "1-4": ["1-4", "9-4"],
      "9-4": ["9-12", "1-4", "9-4"],
    };

    // Convert assignedTo to null if "None", otherwise keep as is
    const assignedTo = lessonData.assignedTo === "None" ? null : lessonData.assignedTo;

    if (assignedTo !== null) {
      const exists = await Lesson.exists({
        date: lessonData.date,
        assignedTo: assignedTo,
        timeLength: {
          $in: conflictingTimeLengths[lessonData.timeLength],
        },
      });

      const errorMssg = `This instructor is already booked on ${lessonData.date} during ${lessonData.timeLength}.`;

      if (exists) {
        throw new Error(errorMssg);
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
    await errorEmail("Failed to create lesson", error.toString());
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
    await errorEmail("Failed to retrieve lessons", error.toString());
    throw error;
  }
}

// ---------- RETRIEVE USERS ----------
export async function retrieveUsers() {
  try {
    const User = utilities.getModel(utilities.UserSchema, "User");
    return await User.find({}).select("-password").lean();
  } catch (error) {
    await errorEmail("Failed to retrieve users", error.toString());
    throw error;
  }
}

// ---------- SWITCH LESSON ASSIGNMENT ----------
export async function switchLessonAssignment(id, newUserId) {
  try {
    utilities.argValidation([id, newUserId], ["Lesson ID", "New User ID"]);
    utilities.dataTypeValidation([id], ["ID"], ["string"]);

    if (newUserId !== null && typeof newUserId !== "string") {
      throw new Error("New User ID must be a string or null");
    }

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    const lessonToAssign = await Lesson.findById(id);

    if (!lessonToAssign) {
      throw new Error("Lesson not found");
    }

    const conflictingTimeLengths = {
      "9-12": ["9-12", "9-4"],
      "1-4": ["1-4", "9-4"],
      "9-4": ["9-12", "1-4", "9-4"],
    };

    // Convert newUserId to null if "None"
    const normalizedUserId = newUserId === "None" ? null : newUserId;

    if (normalizedUserId !== null) {
      const conflictingLesson = await Lesson.findOne({
        _id: { $ne: id },
        assignedTo: normalizedUserId,
        date: lessonToAssign.date,
        timeLength: {
          $in: conflictingTimeLengths[lessonToAssign.timeLength],
        },
      });

      if (conflictingLesson) {
        throw new Error(
          `User is already assigned to a lesson on ${lessonToAssign.date} during ${lessonToAssign.timeLength}`
        );
      }
    }

    const updated = await Lesson.findByIdAndUpdate(
      id,
      { assignedTo: normalizedUserId },
      { new: true }
    );

    return updated;
  } catch (error) {
    await errorEmail("Failed to switch lesson assignment", error.toString());
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
    if (!deleted) throw new Error("Lesson not found or already deleted");

    return {
      success: true,
      message: "Lesson successfully removed",
      lesson: deleted,
    };
  } catch (error) {
    await errorEmail("Failed to remove lesson", error.toString());
    throw error;
  }
}
