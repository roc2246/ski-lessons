import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { dbConnect } from "./models/index.js";
import { ensureLocalAdminUser } from "./models/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

function sanitizeObject(target) {
  if (!target || typeof target !== "object") return target;

  for (const key of Object.keys(target)) {
    const cleanKey = key.replace(/\$|\./g, "");
    const value = target[key];
    if (cleanKey !== key) {
      delete target[key];
    }

    if (value && typeof value === "object") {
      target[cleanKey] = sanitizeObject(Array.isArray(value) ? value : { ...value });
    } else {
      target[cleanKey] = value;
    }
  }

  return target;
}

function mongoSanitizeMiddleware(req, res, next) {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  sanitizeObject(req.query);
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

// API routes FIRST
app.use("/api", routes);

// Serve React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// React router fallback
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Error handler (optional but fine)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
