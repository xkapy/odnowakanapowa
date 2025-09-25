import jwt from "jsonwebtoken";
import type { Context } from "hono";

export const corsMiddleware = () => {
  return async (c: any, next: any) => {
    const origin = c.req.header("Origin");

    const allowedOrigins = new Set([
      "http://localhost:5173",
      "https://odnowakanapowa.pl",
      "https://www.odnowakanapowa.pl",
      "https://odnowakanapowa-frontend-git.pages.dev",
    ]);

    const isPagesDev = typeof origin === "string" && origin.endsWith(".pages.dev");

    if (origin && (allowedOrigins.has(origin) || isPagesDev)) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      c.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      c.header("Access-Control-Allow-Credentials", "true");
    }

    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }

    await next();
  };
};

export const authMiddleware = (JWT_SECRET: string) => {
  return async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Brak autoryzacji" }, 401);
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      c.set("user", payload);
      await next();
    } catch (error) {
      return c.json({ error: "Nieprawidłowy token" }, 401);
    }
  };
};

export const adminMiddleware = (JWT_SECRET: string) => {
  return async (c: any, next: any) => {
    // run auth first
    await authMiddleware(JWT_SECRET)(c, async () => {});

    const userPayload = c.get("user") as any;
    if (!userPayload?.isAdmin) {
      return c.json({ error: "Brak uprawnień administratora" }, 403);
    }

    await next();
  };
};
