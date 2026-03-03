import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncDb } from "./db/index.js";
import { Calendar } from "./models/Calendar.js";
import { calendarsRouter } from "./routes/calendars.js";
import { tasksRouter } from "./routes/tasks.js";
import { weekRouter } from "./routes/week.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/calendars", calendarsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/week", weekRouter);

app.use(express.static(path.join(__dirname, "..", "client-dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "client-dist", "index.html"));
});

const PORT = process.env.PORT ?? 3000;

syncDb()
  .then(async () => {
    const count = await Calendar.count();
    if (count === 0) {
      await Calendar.create({ name: "Мой календарь", color: "#4A90D9" });
    }
    return undefined;
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB sync failed:", err);
    process.exit(1);
  });
