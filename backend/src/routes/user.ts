import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const user = new Hono<CloudflareAppContext>();

// GET /user/profile - get user profile
user.get("/profile", authMiddleware(), async (c) => {
  try {
    // For now return mock user data
    return c.json({
      id: 1,
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      phone: null,
      isAdmin: true,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

export default user;