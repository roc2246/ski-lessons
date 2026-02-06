import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorEmail } from "../email/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../config/.env"),
});

// ✅ Track connection state
let isConnected = false;

export async function dbConnect() {
  if (isConnected) return; // already connected, do nothing

  try {
    const dbOptions = { dbName: "ski-lessons" };
    await mongoose.connect(process.env.URI, dbOptions);

    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("DB connection error:", error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}

process.on("SIGINT", async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;  // mark connection as closed
    console.log("MongoDB disconnected on shutdown");
  }
  process.exit(0);
});


mongoose.connection.on("disconnected", () => {
  isConnected = false; // Mongo dropped connection
  console.log("MongoDB disconnected unexpectedly");
});
