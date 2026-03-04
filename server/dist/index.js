import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncDb } from "./db/index.js";
import { parseAuth } from "./middleware/auth.js";
import { calendarsRouter } from "./routes/calendars.js";
import { contextsRouter } from "./routes/contexts.js";
import { tasksRouter } from "./routes/tasks.js";
import { weekRouter } from "./routes/week.js";
import { authRouter } from "./routes/auth.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", parseAuth);
app.use("/api/auth", authRouter);
app.use("/api/calendars", calendarsRouter);
app.use("/api/contexts", contextsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/week", weekRouter);
app.use(express.static(path.join(__dirname, "..", "client-dist")));
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "client-dist", "index.html"));
});
const PORT = Number(process.env.PORT) || 3000;
syncDb()
    .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("DB sync failed:", err);
    process.exit(1);
});
