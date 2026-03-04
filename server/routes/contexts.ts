import { Router } from "express";
import { Context } from "../models/Context.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const contextsRouter = Router();
contextsRouter.use(requireAuth);

function getUserId(req: AuthRequest): number {
  const id = req.userId;
  if (id == null) throw new Error("unauthorized");
  return id;
}

contextsRouter.get("/", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const list = await Context.findAll({
    where: { userId },
    order: [["id", "ASC"]],
  });
  res.json(list);
});

contextsRouter.post("/", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const { name, color } = req.body as { name?: string; color?: string };
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name required" });
    return;
  }
  if (!color || typeof color !== "string") {
    res.status(400).json({ error: "color required" });
    return;
  }
  const context = await Context.create({
    userId,
    name: name.trim(),
    color: color.trim(),
  });
  res.status(201).json(context);
});

contextsRouter.get("/:id", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const context = await Context.findOne({ where: { id, userId } });
  if (!context) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(context);
});

contextsRouter.patch("/:id", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const context = await Context.findOne({ where: { id, userId } });
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

contextsRouter.delete("/:id", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const n = await Context.destroy({ where: { id, userId } });
  if (n === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).send();
});
