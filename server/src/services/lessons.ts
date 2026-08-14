import * as utilities from "../utilities/index.js";
import { errorEmail } from "../email/index.js";
import { getErrorStatus } from "../utilities/type-guards.js";
import { LessonSchema, type LessonDocument } from "../models/schemas.js";

function isMongoDuplicateKeyError(error: unknown): boolean {
  const record = typeof error === "object" && error !== null ? error as Record<string, unknown> : null;
  return record?.code === 11000 || record?.name === "MongoServerError" && String(record?.message || "").includes("duplicate key");
}

/**
 * Defines overlapping lesson windows that cannot be assigned to the same user on the same date.
 */
const CONFLICTING_TIME_LENGTHS: Record<string, string[]> = {
  "9-12": ["9-12", "9-4"],
  "1-4": ["1-4", "9-4"],
  "9-4": ["9-12", "1-4", "9-4"],
};

interface LessonScheduleView {
  date: string | Date | null | undefined;
  timeLength: string;
}

function createHttpError(message: string, status: number): Error & { status?: number } {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function formatUtcDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKey(value: string | Date | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const isoLike = /^\d{4}-\d{2}-\d{2}/;
    if (isoLike.test(trimmed)) {
      return trimmed.slice(0, 10);
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : formatUtcDateKey(parsed);
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : formatUtcDateKey(value);
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : formatUtcDateKey(parsed);
}

function normalizeLessonDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoDatePrefix = /^\d{4}-\d{2}-\d{2}/;
    if (isoDatePrefix.test(trimmed)) {
      return trimmed.slice(0, 10);
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : formatUtcDateKey(parsed);
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : formatUtcDateKey(value);
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : formatUtcDateKey(parsed);
}

async function notifyIfServerError(subject: string, error: unknown) {
  const status = getErrorStatus(error);
  if (status && status >= 500) {
    await errorEmail(subject, error instanceof Error ? error.toString() : String(error));
  }
}

/**
 * Creates a lesson after required-field, date-normalization, and conflict-window checks.
 */
export async function createLesson(lessonData: Record<string, unknown>): Promise<any> {
  try {
    const requiredFields = ["type", "date", "timeLength", "guests"] as const;

    for (const field of requiredFields) {
      if (lessonData[field] === undefined || lessonData[field] === null) {
        throw new Error(`Required fields missing: ${field.charAt(0).toUpperCase()}${field.slice(1)}`);
      }
    }

    const Lesson = utilities.getModel(LessonSchema, "Lesson");

    const assignedTo = lessonData.assignedTo ?? null;
    const normalizedDate = normalizeLessonDate(lessonData.date);

    if (!normalizedDate) {
      throw new Error("Invalid lesson date");
    }

    if (assignedTo !== null) {
      const conflictingWindows = CONFLICTING_TIME_LENGTHS[String(lessonData.timeLength)] ?? [String(lessonData.timeLength)];
      const existingConflict = await Lesson.exists({
        date: normalizedDate,
        assignedTo,
        timeLength: {
          $in: conflictingWindows,
        },
      });

      if (existingConflict) {
        throw createHttpError("A lesson already exists for this date and time slot.", 409);
      }
    }

    const newLesson = new Lesson({
      ...lessonData,
      assignedTo,
      date: normalizedDate,
    });

    await newLesson.save();

    return newLesson;
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) {
      throw createHttpError("A lesson already exists for this date and time slot.", 409);
    }

    await notifyIfServerError("Failed to create lesson", error);
    throw error;
  }
}

export async function retrieveLessons(param: Record<string, unknown>, limit = 50, skip = 0): Promise<any[]> {
  try {
    const Lesson = utilities.getModel(LessonSchema, "Lesson");

    return await Lesson.find(param).limit(limit).skip(skip).lean();
  } catch (error: unknown) {
    await notifyIfServerError("Failed to retrieve lessons", error);
    throw error;
  }
}

/**
 * Returns unassigned lessons the user can take without creating time-window conflicts.
 */
export async function retrieveAvailableLessonsForUser(userId: string, limit = 50, skip = 0): Promise<any[]> {
  try {
    const [availableLessonsRaw, userLessonsRaw] = await Promise.all([
      retrieveLessons({ assignedTo: null }, limit, skip),
      retrieveLessons({ assignedTo: userId }),
    ]);

    const availableLessons = availableLessonsRaw as LessonScheduleView[];
    const userLessons = userLessonsRaw as LessonScheduleView[];

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
  } catch (error: unknown) {
    await notifyIfServerError("Failed to retrieve available lessons", error);
    throw error;
  }
}

export async function updateLesson(id: string, lessonData: Record<string, unknown>): Promise<any> {
  try {
    const Lesson = utilities.getModel(LessonSchema, "Lesson");
    const existingLesson = await Lesson.findById(id).lean();

    if (!existingLesson) {
      throw createHttpError("Lesson not found", 404);
    }

    const assignedTo = lessonData.assignedTo ?? null;
    const parsedDate = normalizeLessonDate(lessonData.date);
    const conflictingWindows = CONFLICTING_TIME_LENGTHS[String(lessonData.timeLength)] || [String(lessonData.timeLength)];

    if (!parsedDate) {
      throw new Error("Invalid lesson date");
    }

    if (assignedTo !== null) {
      const conflict = await Lesson.findOne({
        _id: { $ne: id },
        assignedTo,
        date: parsedDate,
        timeLength: {
          $in: conflictingWindows,
        },
      });

      if (conflict) {
        throw createHttpError(
          `This instructor is already booked on ${parsedDate} during ${lessonData.timeLength}.`,
          409
        );
      }
    }

    const updated = await Lesson.findByIdAndUpdate(
      id,
      {
        ...lessonData,
        assignedTo,
        date: parsedDate,
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!updated) {
      throw createHttpError("Lesson not found", 404);
    }

    return updated;
  } catch (error: unknown) {
    await notifyIfServerError("Failed to update lesson", error);
    throw error;
  }
}

/**
 * Assigns an unclaimed lesson to a user when no conflicting lesson exists for that date.
 */
export async function switchLessonAssignment(id: string, newUserId: string | null): Promise<any> {
  try {
    if (newUserId !== null && typeof newUserId !== "string") {
      throw createHttpError("New User ID must be a string or null", 400);
    }

    const Lesson = utilities.getModel(LessonSchema, "Lesson");

    const lessonToAssign = await Lesson.findById(id).lean();

    if (!lessonToAssign) {
      throw createHttpError("Lesson not found", 404);
    }

    if (newUserId !== null) {
      if (typeof lessonToAssign.timeLength !== "string") {
        throw createHttpError("Lesson has invalid time length", 500);
      }

      const conflictingWindows = CONFLICTING_TIME_LENGTHS[lessonToAssign.timeLength] ?? [lessonToAssign.timeLength];

      const conflictingLesson = await Lesson.findOne({
        _id: { $ne: id },
        assignedTo: newUserId,
        date: lessonToAssign.date,
        timeLength: {
          $in: conflictingWindows,
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
      { returnDocument: "after" }
    );

    if (!updated) {
      throw createHttpError("Lesson already assigned", 409);
    }

    return updated;
  } catch (error: unknown) {
    await notifyIfServerError("Failed to switch lesson assignment", error);
    throw error;
  }
}

export async function unassignAllLessons(userId: string): Promise<void> {
  try {
    const Lesson = utilities.getModel(LessonSchema, "Lesson");
    await Lesson.updateMany({ assignedTo: userId }, { assignedTo: null });
  } catch (error: unknown) {
    await notifyIfServerError("Failed to unassign lessons", error);
    throw error;
  }
}

export async function removeLesson(id: string): Promise<any> {
  try {
    const Lesson = utilities.getModel(LessonSchema, "Lesson");

    const deleted = await Lesson.findByIdAndDelete(id);
    if (!deleted) throw createHttpError("Lesson not found or already deleted", 404);

    return {
      success: true,
      message: "Lesson successfully removed",
      lesson: deleted,
    };
  } catch (error: unknown) {
    await notifyIfServerError("Failed to remove lesson", error);
    throw error;
  }
}
