import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import type { NextFunction, Request, Response } from "express";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { dbConnect, ensureLocalAdminUser } from "./models/index.js";
import { sanitizeRequest } from "./middleware/sanitize.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();
const port = Number(process.env.PORT ?? 3000);

let databaseReady = false;

try {
  await dbConnect();
  databaseReady = true;
} catch (error) {
  console.warn("MongoDB unavailable; continuing in degraded mode.", error);
}

try {
  await ensureLocalAdminUser();
} catch (error) {
  console.warn("Admin bootstrap skipped due to startup issue.", error);
}

app.use(helmet());
app.use(express.json());
app.use(sanitizeRequest);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api", routes);
app.use(express.static(clientDistPath));

if (process.env.NODE_ENV === "production") {
  app.get(/.*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  if (!databaseReady) {
    console.warn("MongoDB is not available; API routes that depend on the database will fail until the connection is restored.");
  }
});
