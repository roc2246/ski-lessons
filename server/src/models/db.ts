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
