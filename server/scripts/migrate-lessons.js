import mongoose from "mongoose";
import { dbConnect } from "../models/db.js";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

async function migrateLessons() {
  await dbConnect();

  const lessons = mongoose.connection.collection("lessons");

  const cursor = lessons.find({
    $or: [
      { assignedTo: "None" },
      { assignedTo: { $type: "string" } },
      { date: { $type: "string" } },
    ],
  });

  let scanned = 0;
  let updated = 0;
  let failed = 0;

  while (await cursor.hasNext()) {
    const lesson = await cursor.next();
    scanned += 1;

    const set = {};

    if (typeof lesson.date === "string") {
      const parsedDate = parseDate(lesson.date);
      if (!parsedDate) {
        failed += 1;
        console.warn(`Skipping ${lesson._id}: invalid date '${lesson.date}'`);
        continue;
      }
      set.date = parsedDate;
    }

    if (lesson.assignedTo === "None") {
      set.assignedTo = null;
    } else if (
      typeof lesson.assignedTo === "string" &&
      lesson.assignedTo.length > 0 &&
      OBJECT_ID_REGEX.test(lesson.assignedTo)
    ) {
      set.assignedTo = new mongoose.Types.ObjectId(lesson.assignedTo);
    }

    if (Object.keys(set).length === 0) {
      continue;
    }

    await lessons.updateOne({ _id: lesson._id }, { $set: set });
    updated += 1;
  }

  console.log("Lesson migration complete");
  console.log(`Scanned: ${scanned}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped/Failed: ${failed}`);

  await mongoose.disconnect();
}

migrateLessons().catch(async (error) => {
  console.error("Migration failed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore secondary disconnect errors
  }
  process.exit(1);
});
