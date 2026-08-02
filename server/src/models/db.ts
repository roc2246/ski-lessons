import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorEmail } from "../email/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../config/.env");
dotenv.config({ path: envPath });

let isConnected = false;

export function isDatabaseReady(): boolean {
  return isConnected;
}

async function ensureLessonIndexes() {
  try {
    const lessonsCollection = mongoose.connection.db?.collection("lessons");
    if (!lessonsCollection) {
      return;
    }

    try {
      await lessonsCollection.dropIndex("date_1_assignedTo_1");
    } catch {
      // Ignore missing or already-migrated indexes.
    }

    await lessonsCollection.createIndex(
      { date: 1, assignedTo: 1 },
      {
        unique: true,
        partialFilterExpression: { assignedTo: { $type: "objectId" } },
        name: "date_1_assignedTo_1",
      }
    );
  } catch (error) {
    console.warn("Lesson index update skipped:", error);
  }
}

export async function dbConnect() {
  if (isConnected) return;

  const mongoUri = process.env.URI?.trim();
  if (!mongoUri || (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://"))) {
    const message = `Invalid MongoDB URI: ${mongoUri ?? "<missing>"}`;
    console.warn(message);
    throw new Error(message);
  }

  try {
    const dbOptions = { dbName: "ski-lessons" };
    await mongoose.connect(mongoUri, dbOptions);

    isConnected = true;
    console.log("✅ MongoDB connected");
    await ensureLessonIndexes();
  } catch (error) {
    console.warn("DB connection error:", error);
    await errorEmail("Connection Failed", error instanceof Error ? error.toString() : String(error));
    throw error;
  }
}

process.on("SIGINT", async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected on shutdown");
  }
  process.exit(0);
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("MongoDB disconnected unexpectedly");
});
