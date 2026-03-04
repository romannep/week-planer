import { Router } from "express";
import { Op } from "sequelize";
import { Calendar } from "../models/Calendar.js";
import { Context } from "../models/Context.js";
import { Task } from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";
export const tasksRouter = Router();
tasksRouter.use(requireAuth);
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
tasksRouter.get("/", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    if (calendarIds.length === 0) {
        res.json([]);
        return;
    }
    const calendarId = req.query.calendarId != null ? Number(req.query.calendarId) : undefined;
    const from = req.query.from;
    const to = req.query.to;
    const someday = req.query.someday === "true";
    const where = { calendarId: { [Op.in]: calendarIds } };
    if (calendarId != null && !Number.isNaN(calendarId) && calendarIds.includes(calendarId)) {
        where.calendarId = calendarId;
    }
    if (someday) {
        where.date = null;
    }
    else if (from && to) {
        where.date = { [Op.between]: [from, to] };
    }
    const list = await Task.findAll({
        where,
        include: [{ model: Context, as: "Context", required: false }],
        order: [
            ["date", "ASC"],
            ["orderInDay", "ASC"],
            ["id", "ASC"],
        ],
    });
    res.json(list);
});
tasksRouter.post("/", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    if (calendarIds.length === 0) {
        res.status(400).json({ error: "no calendar" });
        return;
    }
    const body = req.body;
    if (!body.title || typeof body.title !== "string") {
        res.status(400).json({ error: "title required" });
        return;
    }
    const calendarId = body.calendarId != null && !Number.isNaN(body.calendarId) && calendarIds.includes(body.calendarId)
        ? body.calendarId
        : calendarIds[0];
    let contextId = null;
    if (body.contextId != null && body.contextId !== "" && !Number.isNaN(Number(body.contextId))) {
        const cid = Number(body.contextId);
        const ctx = await Context.findOne({ where: { id: cid, userId } });
        if (ctx)
            contextId = cid;
    }
    const maxOrder = await Task.max("orderInDay", {
        where: { calendarId, date: body.date ?? null },
    });
    const task = await Task.create({
        calendarId,
        contextId,
        title: body.title.trim(),
        notes: body.notes ?? null,
        date: body.date ?? null,
        orderInDay: (Number(maxOrder) || 0) + 1,
        recurringRule: body.recurringRule ?? "none",
    });
    const withContext = await Task.findByPk(task.id, {
        include: [{ model: Context, as: "Context", required: false }],
    });
    res.status(201).json(withContext ?? task);
});
tasksRouter.get("/:id", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    const task = await Task.findOne({
        where: { id, calendarId: { [Op.in]: calendarIds } },
        include: [{ model: Context, as: "Context", required: false }],
    });
    if (!task) {
        res.status(404).json({ error: "not found" });
        return;
    }
    res.json(task);
});
tasksRouter.patch("/:id", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    const task = await Task.findOne({ where: { id, calendarId: { [Op.in]: calendarIds } } });
    if (!task) {
        res.status(404).json({ error: "not found" });
        return;
    }
    const body = req.body;
    if (typeof body.title === "string")
        task.title = body.title.trim();
    if (body.notes !== undefined)
        task.notes = body.notes;
    if (body.date !== undefined)
        task.date = body.date;
    if (typeof body.completed === "boolean")
        task.completed = body.completed;
    if (body.contextId !== undefined) {
        if (body.contextId === null) {
            task.contextId = null;
        }
        else {
            const ctx = await Context.findOne({
                where: { id: body.contextId, userId },
            });
            if (ctx)
                task.contextId = body.contextId;
        }
    }
    if (typeof body.orderInDay === "number")
        task.orderInDay = body.orderInDay;
    if (body.recurringRule !== undefined)
        task.recurringRule = body.recurringRule;
    await task.save();
    const withContext = await Task.findByPk(task.id, {
        include: [{ model: Context, as: "Context", required: false }],
    });
    res.json(withContext ?? task);
});
tasksRouter.delete("/:id", async (req, res) => {
    const userId = getUserId(req);
    const calendarIds = await getUserCalendarIds(userId);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    const n = await Task.destroy({
        where: { id, calendarId: { [Op.in]: calendarIds } },
    });
    if (n === 0) {
        res.status(404).json({ error: "not found" });
        return;
    }
    res.status(204).send();
});
