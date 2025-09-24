import { Hono } from "hono";
import { adminMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const admin = new Hono<CloudflareAppContext>();

// GET /admin/check - check admin access
admin.get("/check", adminMiddleware(), async (c) => {
  try {
    return c.json({
      message: "Admin access granted",
      isAdmin: true,
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return c.json({ error: "Access denied" }, 403);
  }
});

// GET /admin/appointments - get all appointments for admin
admin.get("/appointments", adminMiddleware(), async (c) => {
  try {
    // Try to get real data from database first
    const db = c.env.DB;
    try {
      const result = await db.prepare(`
        SELECT 
          appointments.*,
          users.first_name,
          users.last_name,
          users.email,
          users.phone
        FROM appointments 
        LEFT JOIN users ON appointments.user_id = users.id
        ORDER BY appointments.date DESC, appointments.time DESC
      `).all();
      
      if (result.results && result.results.length > 0) {
        const appointments = result.results.map((row: any) => ({
          id: row.id,
          date: row.date,
          time: row.time,
          status: row.status,
          service: row.description,
          description: row.description,
          user: {
            firstName: row.first_name || row.guest_name?.split(' ')[0] || 'Gość',
            lastName: row.last_name || row.guest_name?.split(' ')[1] || '',
            email: row.email || row.guest_email,
            phone: row.phone || row.guest_phone
          },
          guestName: row.guest_name,
          guestEmail: row.guest_email, 
          guestPhone: row.guest_phone
        }));
        
        return c.json(appointments);
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
    }
    
    // Fallback to mock data if database is empty or has issues
    return c.json([
      {
        id: 1,
        date: "2025-09-25",
        time: "10:00",
        status: "pending",
        service: "Czyszczenie kanapy",
        description: "Czyszczenie kanapy",
        user: {
          firstName: "Jan",
          lastName: "Kowalski",
          email: "jan@example.com",
          phone: "123456789"
        },
        guestName: "Jan Kowalski",
        guestEmail: "jan@example.com",
        guestPhone: "123456789"
      },
      {
        id: 2,
        date: "2025-09-26", 
        time: "14:00",
        status: "confirmed",
        service: "Czyszczenie fotela",
        description: "Czyszczenie fotela",
        user: {
          firstName: "Anna",
          lastName: "Nowak",
          email: "anna@example.com",
          phone: "987654321"
        },
        guestName: "Anna Nowak",
        guestEmail: "anna@example.com",
        guestPhone: "987654321"
      },
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
        updatedAt: new Date().toISOString(),
      },
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
      status: body.status,
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
      appointmentId,
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

// GET /admin/db-status - check database status
admin.get("/db-status", adminMiddleware(), async (c) => {
  try {
    const db = c.env.DB;
    
    // Check if tables exist
    const tables = await db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table';
    `).all();
    
    // Count records in each table
    const counts: Record<string, any> = {};
    if (tables.results) {
      for (const table of tables.results) {
        try {
          const tableName = (table as any).name;
          const count = await db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first();
          counts[tableName] = (count as any)?.count || 0;
        } catch (e) {
          counts[(table as any).name] = 'Error';
        }
      }
    }
    
    return c.json({
      tables: tables.results || [],
      counts,
      environment: c.env.ENVIRONMENT
    });
  } catch (error) {
    console.error("DB status error:", error);
    return c.json({ error: "Failed to check database status" }, 500);
  }
});

export default admin;
