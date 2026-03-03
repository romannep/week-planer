import { Router } from "express";
import { Context } from "../models/Context.js";

export const contextsRouter = Router();

contextsRouter.get("/", async (_req, res) => {
  const list = await Context.findAll({ order: [["id", "ASC"]] });
  res.json(list);
});

contextsRouter.post("/", async (req, res) => {
  const { name, color } = req.body as { name?: string; color?: string };
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name required" });
    return;
  }
  if (!color || typeof color !== "string") {
    res.status(400).json({ error: "color required" });
    return;
  }
  const context = await Context.create({ name: name.trim(), color: color.trim() });
  res.status(201).json(context);
});

contextsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const context = await Context.findByPk(id);
  if (!context) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(context);
});

contextsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const context = await Context.findByPk(id);
  if (!context) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const { name, color } = req.body as { name?: string; color?: string };
  if (typeof name === "string") context.name = name.trim();
  if (typeof color === "string") context.color = color.trim();
  await context.save();
  res.json(context);
});

contextsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const n = await Context.destroy({ where: { id } });
  if (n === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).send();
});
