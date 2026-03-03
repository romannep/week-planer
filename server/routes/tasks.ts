import { Router } from "express";
import { Op } from "sequelize";
import { Task } from "../models/Task.js";
import type { RecurringRule } from "../models/Task.js";

export const tasksRouter = Router();

tasksRouter.get("/", async (req, res) => {
  const calendarId = req.query.calendarId != null ? Number(req.query.calendarId) : undefined;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const someday = req.query.someday === "true";

  const where: Record<string, unknown> = {};
  if (calendarId != null && !Number.isNaN(calendarId)) where.calendarId = calendarId;
  if (someday) {
    where.date = null;
  } else if (from && to) {
    where.date = { [Op.between]: [from, to] };
  }

  const list = await Task.findAll({
    where,
    order: [
      ["date", "ASC"],
      ["orderInDay", "ASC"],
      ["id", "ASC"],
    ],
  });
  res.json(list);
});

tasksRouter.post("/", async (req, res) => {
  const body = req.body as {
    calendarId?: number;
    title?: string;
    notes?: string;
    date?: string | null;
    color?: string | null;
    recurringRule?: RecurringRule;
  };
  if (!body.title || typeof body.title !== "string") {
    res.status(400).json({ error: "title required" });
    return;
  }
  const calendarId = body.calendarId != null && !Number.isNaN(body.calendarId) ? body.calendarId : 1;
  const maxOrder = await Task.max("orderInDay", {
    where: { calendarId, date: body.date ?? null },
  });
  const task = await Task.create({
    calendarId,
    title: body.title.trim(),
    notes: body.notes ?? null,
    date: body.date ?? null,
    color: body.color ?? null,
    orderInDay: (Number(maxOrder) || 0) + 1,
    recurringRule: body.recurringRule ?? "none",
  });
  res.status(201).json(task);
});

tasksRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const task = await Task.findByPk(id);
  if (!task) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(task);
});

tasksRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const task = await Task.findByPk(id);
  if (!task) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const body = req.body as Partial<{
    title: string;
    notes: string | null;
    date: string | null;
    completed: boolean;
    color: string | null;
    orderInDay: number;
    recurringRule: RecurringRule;
  }>;
  if (typeof body.title === "string") task.title = body.title.trim();
  if (body.notes !== undefined) task.notes = body.notes;
  if (body.date !== undefined) task.date = body.date;
  if (typeof body.completed === "boolean") task.completed = body.completed;
  if (body.color !== undefined) task.color = body.color;
  if (typeof body.orderInDay === "number") task.orderInDay = body.orderInDay;
  if (body.recurringRule !== undefined) task.recurringRule = body.recurringRule;
  await task.save();
  res.json(task);
});

tasksRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const n = await Task.destroy({ where: { id } });
  if (n === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).send();
});
