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

    const newLesson = new Lesson({ ...lessonData });
    await newLesson.save();

    return newLesson;
  } catch (error) {
    await errorEmail("Failed to create lesson", error.toString());
    throw error;
  }
}

// ---------- RETRIEVE LESSONS ----------
export async function retrieveLessons(param) {
  try {
    utilities.argValidation([param], ["Param"]);
    utilities.dataTypeValidation([param], ["Param"], ["object"]);

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    return await Lesson.find(param);
  } catch (error) {
    await errorEmail("Failed to retrieve lessons", error.toString());
    throw error;
  }
}

// ---------- RETRIEVE USERS ----------
export async function retrieveUsers() {
  try {
    const User = utilities.getModel(utilities.UserSchema, "User");
    return await User.find({}).select("-password");
  } catch (error) {
    await errorEmail("Failed to retrieve users", error.toString());
    throw error;
  }
}

// ---------- SWITCH LESSON ASSIGNMENT ----------
export async function switchLessonAssignment(id, newUserId) {
  try {
    utilities.argValidation([id, newUserId], ["Lesson ID", "New User ID"]);
    utilities.dataTypeValidation(
      [id, newUserId],
      ["ID", "New User ID"],
      ["string", "string"]
    );

    const Lesson = utilities.getModel(utilities.LessonSchema, "Lesson");

    const updated = await Lesson.findByIdAndUpdate(
      id,
      { assignedTo: newUserId },
      { new: true }
    );

    if (!updated) throw new Error("Lesson not found");

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
