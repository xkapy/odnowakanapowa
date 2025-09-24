import { Hono } from "hono";
import { adminMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const admin = new Hono<CloudflareAppContext>();

// GET /admin/dashboard - get admin dashboard data
admin.get("/dashboard", adminMiddleware(), async (c) => {
  try {
    return c.json({
      stats: {
        totalAppointments: 5,
        pendingAppointments: 2,
        completedAppointments: 3,
        totalUsers: 10,
      },
      recentAppointments: [
        {
          id: 1,
          date: "2025-09-25",
          time: "10:00",
          guestName: "Jan Kowalski",
          status: "pending",
        },
      ],
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return c.json({ error: "Failed to get dashboard data" }, 500);
  }
});

export default admin;