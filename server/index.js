import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import { dbConnect } from "./models/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

await dbConnect();

app.use(express.json());

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
