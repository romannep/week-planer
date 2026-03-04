import { Router } from "express";
import { Op } from "sequelize";
import { Calendar } from "../models/Calendar.js";
import { Context } from "../models/Context.js";
import { Task } from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";
export const weekRouter = Router();
weekRouter.use(requireAuth);
function getUserId(req) {
    const id = req.userId;
    if (id == null)
        throw new Error("unauthorized");
    return id;
}
async function getUserCalendarIds(userId) {
    const list = await Calendar.findAll({ where: { userId }, attributes: ["id"] });
    return list.map((c) => c.id);
}
function getWeekBounds(year, week) {
    const jan1 = new Date(year, 0, 1);
    const firstMonday = new Date(jan1);
    const day = jan1.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    firstMonday.setDate(jan1.getDate() + diff);
    const monday = new Date(firstMonday);
    monday.setDate(firstMonday.getDate() + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d) => d.toISOString().slice(0, 10);
    return { monday: fmt(monday), sunday: fmt(sunday) };
}
weekRouter.get("/:year/:week", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    if (calendarIds.length === 0) {
        res.json({ monday: "", sunday: "", tasks: [] });
        return;
    }
    const year = Number(req.params.year);
    const week = Number(req.params.week);
    if (Number.isNaN(year) || Number.isNaN(week)) {
        res.status(400).json({ error: "invalid year or week" });
        return;
    }
    const calendarId = req.query.calendarId != null && calendarIds.includes(Number(req.query.calendarId))
        ? Number(req.query.calendarId)
        : calendarIds[0];
    const { monday, sunday } = getWeekBounds(year, week);
    const tasks = await Task.findAll({
        where: {
            calendarId,
            date: { [Op.between]: [monday, sunday] },
        },
        include: [{ model: Context, as: "Context", required: false }],
        order: [
            ["date", "ASC"],
            ["orderInDay", "ASC"],
            ["id", "ASC"],
        ],
    });
    res.json({ monday, sunday, tasks });
});
weekRouter.get("/someday", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    if (calendarIds.length === 0) {
        res.json([]);
        return;
    }
    const calendarId = req.query.calendarId != null && calendarIds.includes(Number(req.query.calendarId))
        ? Number(req.query.calendarId)
        : calendarIds[0];
    const tasks = await Task.findAll({
        where: { calendarId, date: null },
        include: [{ model: Context, as: "Context", required: false }],
        order: [["orderInDay", "ASC"], ["id", "ASC"]],
    });
    res.json(tasks);
});
weekRouter.post("/roll", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    if (calendarIds.length === 0) {
        res.status(400).json({ error: "no calendar" });
        return;
    }
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
        res.status(400).json({ error: "fromDate and toDate required" });
        return;
    }
    const calendarId = req.body.calendarId != null && calendarIds.includes(Number(req.body.calendarId))
        ? Number(req.body.calendarId)
        : calendarIds[0];
    const updated = await Task.update({ date: toDate }, {
        where: {
            calendarId,
            date: fromDate,
            completed: false,
            recurringRule: "none",
        },
    });
    res.json({ updated: updated[0] });
});
