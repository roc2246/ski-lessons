import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import type { NextFunction, Request, Response } from "express";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { dbConnect, ensureLocalAdminUser } from "./models/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT ?? 3000);

function sanitizeObject(target: unknown): unknown {
  if (!target || typeof target !== "object") {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(target as Record<string, unknown>)) {
    const cleanKey = key.replace(/\$|\./g, "");
    sanitized[cleanKey] = sanitizeObject(value);
  }

  return sanitized;
}

function mongoSanitizeMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeObject(req.body) as typeof req.body;
  req.params = sanitizeObject(req.params) as typeof req.params;
  req.query = sanitizeObject(req.query) as typeof req.query;
  next();
}

await dbConnect();
await ensureLocalAdminUser();

app.use(helmet());
app.use(express.json());
app.use(mongoSanitizeMiddleware);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api", routes);
app.use(express.static(path.join(__dirname, "../client/dist")));

if (process.env.NODE_ENV === "production") {
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
