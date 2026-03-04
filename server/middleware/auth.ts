import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "weekplanner-dev-secret";
const COOKIE_NAME = "session";

export interface JwtPayload {
  userId: number;
}

export type AuthErrorCode = "NO_TOKEN" | "INVALID_TOKEN";

export type AuthRequest = Request & { userId?: number; authError?: AuthErrorCode };

export function signToken(userId: number): string {
  return jwt.sign({ userId } as JwtPayload, JWT_SECRET, { expiresIn: "7d" });
}

export function parseAuth(req: Request, res: Response, next: NextFunction): void {
  const token =
    (req.cookies?.[COOKIE_NAME] as string | undefined) ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);
  const ext = req as AuthRequest;
  if (!token) {
    ext.authError = "NO_TOKEN";
    next();
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    ext.userId = decoded.userId;
  } catch {
    ext.authError = "INVALID_TOKEN";
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const ext = req as AuthRequest;
  if (ext.userId != null) {
    next();
    return;
  }
  res.status(401).json({
    error: "unauthorized",
    code: ext.authError ?? "NO_TOKEN",
  });
}

export { COOKIE_NAME };
