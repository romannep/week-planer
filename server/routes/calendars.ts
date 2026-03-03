import { Router } from "express";
import { Calendar } from "../models/Calendar.js";

export const calendarsRouter = Router();

calendarsRouter.get("/", async (_req, res) => {
  const list = await Calendar.findAll({ order: [["id", "ASC"]] });
  res.json(list);
});

calendarsRouter.post("/", async (req, res) => {
  const { name, color } = req.body as { name?: string; color?: string };
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name required" });
    return;
  }
  const calendar = await Calendar.create({
    name: name.trim(),
    color: typeof color === "string" ? color : "#4A90D9",
  });
  res.status(201).json(calendar);
});

calendarsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const calendar = await Calendar.findByPk(id);
  if (!calendar) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(calendar);
});

calendarsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const calendar = await Calendar.findByPk(id);
  if (!calendar) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const { name, color } = req.body as { name?: string; color?: string };
  if (typeof name === "string") calendar.name = name.trim();
  if (typeof color === "string") calendar.color = color;
  await calendar.save();
  res.json(calendar);
});

calendarsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const n = await Calendar.destroy({ where: { id } });
  if (n === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).send();
});
