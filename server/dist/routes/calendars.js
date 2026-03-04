import { Router } from "express";
import { Calendar } from "../models/Calendar.js";
import { requireAuth } from "../middleware/auth.js";
export const calendarsRouter = Router();
calendarsRouter.use(requireAuth);
function getUserId(req) {
    const id = req.userId;
    if (id == null)
        throw new Error("unauthorized");
    return id;
}
calendarsRouter.get("/", async (req, res) => {
    const userId = getUserId(req);
    let list = await Calendar.findAll({
        where: { userId },
        order: [["id", "ASC"]],
    });
    if (list.length === 0) {
        const created = await Calendar.create({
            userId,
            name: "Мой календарь",
            color: "#4A90D9",
        });
        list = [created];
    }
    res.json(list);
});
calendarsRouter.post("/", async (req, res) => {
    const userId = getUserId(req);
    const { name, color } = req.body;
    if (!name || typeof name !== "string") {
        res.status(400).json({ error: "name required" });
        return;
    }
    const calendar = await Calendar.create({
        userId,
        name: name.trim(),
        color: typeof color === "string" ? color : "#4A90D9",
    });
    res.status(201).json(calendar);
});
calendarsRouter.get("/:id", async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    const calendar = await Calendar.findOne({ where: { id, userId } });
    if (!calendar) {
        res.status(404).json({ error: "not found" });
        return;
    }
    res.json(calendar);
});
calendarsRouter.patch("/:id", async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    const calendar = await Calendar.findOne({ where: { id, userId } });
    if (!calendar) {
        res.status(404).json({ error: "not found" });
        return;
    }
    const { name, color } = req.body;
    if (typeof name === "string")
        calendar.name = name.trim();
    if (typeof color === "string")
        calendar.color = color;
    await calendar.save();
    res.json(calendar);
});
calendarsRouter.delete("/:id", async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }
    const n = await Calendar.destroy({ where: { id, userId } });
    if (n === 0) {
        res.status(404).json({ error: "not found" });
        return;
    }
    res.status(204).send();
});
