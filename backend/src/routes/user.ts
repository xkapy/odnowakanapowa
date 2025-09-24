import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const user = new Hono<CloudflareAppContext>();

// GET /user/profile - get user profile
user.get("/profile", authMiddleware(), async (c) => {
  try {
    // Return admin user data
    return c.json({
      id: 1,
      email: "odnowakanapowa@gmail.com",
      firstName: "Adam",
      lastName: "Gembalczyk",
      phone: "785922680",
      isAdmin: true,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

export default user;
