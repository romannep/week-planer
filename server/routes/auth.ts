import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Calendar } from "../models/Calendar.js";
import { signToken, requireAuth, COOKIE_NAME } from "../middleware/auth.js";

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

authRouter.post("/register", async (req: Request, res: Response) => {
  const { login, password } = req.body as { login?: string; password?: string };
  if (!login || typeof login !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "login and password required" });
    return;
  }
  const trimmed = login.trim();
  if (trimmed.length < 2) {
    res.status(400).json({ error: "login too short" });
    return;
  }
  if (password.length < 4) {
    res.status(400).json({ error: "password too short" });
    return;
  }
  const existing = await User.findOne({ where: { login: trimmed } });
  if (existing) {
    res.status(409).json({ error: "login already taken" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ login: trimmed, passwordHash });
  await Calendar.create({ userId: user.id, name: "Мой календарь", color: "#4A90D9" });
  const token = signToken(user.id);
  res
    .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    .status(201)
    .json({ user: { id: user.id, login: user.login } });

});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { login, password } = req.body as { login?: string; password?: string };
  if (!login || typeof login !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "login and password required" });
    return;
  }
  const user = await User.findOne({ where: { login: login.trim() } });
  if (!user) {
    res.status(401).json({ error: "invalid login or password" });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "invalid login or password" });
    return;
  }
  const token = signToken(user.id);
  res
    .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    .json({ user: { id: user.id, login: user.login } });
});

authRouter.post("/logout", (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  User.findByPk(userId, { attributes: ["id", "login"] })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }
      res.json({ user: { id: user.id, login: user.login } });
    })
    .catch(() => res.status(500).json({ error: "server error" }));
});
