import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET ?? "weekplanner-dev-secret";
const COOKIE_NAME = "session";
export function signToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
export function parseAuth(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME] ??
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : undefined);
    const ext = req;
    if (!token) {
        ext.authError = "NO_TOKEN";
        next();
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ext.userId = decoded.userId;
    }
    catch {
        ext.authError = "INVALID_TOKEN";
    }
    next();
}
export function requireAuth(req, res, next) {
    const ext = req;
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
