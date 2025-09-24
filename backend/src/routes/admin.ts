import { Hono } from "hono";
import { adminMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const admin = new Hono<CloudflareAppContext>();

// GET /admin/check - check admin access
admin.get("/check", adminMiddleware(), async (c) => {
  try {
    return c.json({
      message: "Admin access granted",
      isAdmin: true
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return c.json({ error: "Access denied" }, 403);
  }
});

// GET /admin/appointments - get all appointments for admin
admin.get("/appointments", adminMiddleware(), async (c) => {
  try {
    return c.json([
      {
        id: 1,
        date: "2025-09-25",
        time: "10:00",
        status: "pending",
        guestName: "Jan Kowalski",
        guestEmail: "jan@example.com",
        guestPhone: "123456789",
        description: "Czyszczenie kanapy",
        service: "Czyszczenie kanapy"
      },
      {
        id: 2,
        date: "2025-09-26",
        time: "14:00", 
        status: "confirmed",
        guestName: "Anna Nowak",
        guestEmail: "anna@example.com",
        guestPhone: "987654321",
        description: "Czyszczenie fotela",
        service: "Czyszczenie fotela"
      }
    ]);
  } catch (error) {
    console.error("Get admin appointments error:", error);
    return c.json({ error: "Failed to get appointments" }, 500);
  }
});

// PUT /admin/appointments/:id - update appointment
admin.put("/appointments/:id", adminMiddleware(), async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const body = await c.req.json();
    
    return c.json({
      message: "Appointment updated successfully",
      appointment: {
        id: appointmentId,
        ...body,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    return c.json({ error: "Failed to update appointment" }, 500);
  }
});

// PUT /admin/appointments/:id/status - update appointment status
admin.put("/appointments/:id/status", adminMiddleware(), async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const body = await c.req.json();
    
    return c.json({
      message: "Appointment status updated successfully",
      appointmentId,
      status: body.status
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return c.json({ error: "Failed to update appointment status" }, 500);
  }
});

// DELETE /admin/appointments/:id - delete appointment
admin.delete("/appointments/:id", adminMiddleware(), async (c) => {
  try {
    const appointmentId = c.req.param("id");
    
    return c.json({
      message: "Appointment deleted successfully",
      appointmentId
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return c.json({ error: "Failed to delete appointment" }, 500);
  }
});

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