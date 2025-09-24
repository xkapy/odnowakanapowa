import type { Context, Next } from "hono";
import type { CloudflareAppContext } from "../types/cloudflare";

// Simple auth middleware for Cloudflare Workers
export const authMiddleware = () => {
  return async (c: Context<CloudflareAppContext>, next: Next) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    // Simple token validation - replace with proper JWT validation
    if (token === "admin-token-123") {
      await next();
    } else {
      return c.json({ error: "Invalid token" }, 401);
    }
  };
};

export const adminMiddleware = () => {
  return async (c: Context<CloudflareAppContext>, next: Next) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    
    if (token !== "admin-token-123") {
      return c.json({ error: "Admin access required" }, 403);
    }

    await next();
  };
};