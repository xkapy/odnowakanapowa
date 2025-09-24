import jwt from "jsonwebtoken";
import type { Context, Next } from "hono";
import type { JWTPayload } from "../db/database";
import type { AppContext } from "../types/hono";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authMiddleware = async (c: Context<AppContext>, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Brak tokenu autoryzacji" }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Add user info to context
    c.set("user", decoded);

    await next();
  } catch (error) {
    return c.json({ error: "Nieprawidłowy token" }, 401);
  }
};

export const adminMiddleware = async (c: Context<AppContext>, next: Next) => {
  const user = c.get("user");

  if (!user || user.role !== "admin") {
    return c.json({ error: "Brak uprawnień administratora" }, 403);
  }

  await next();
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
