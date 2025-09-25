import type { Hono } from "hono";
import { getAppointmentServices } from "./services";

export default function registerAdminRoutes(app: Hono<any>, adminMiddleware: any) {
  app.get("/api/admin/check", adminMiddleware, async (c) => {
    return c.json({ success: true, message: "Uprawnienia administratora potwierdzone" });
  });

  app.get("/api/admin/appointments", adminMiddleware, async (c) => {
    try {
      const appointments = await (c.env as any).DB.prepare(
        `SELECT a.*, u.first_name, u.last_name, u.email, u.phone as user_phone FROM appointments a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.date DESC, a.time DESC`
      ).all();
      const appointmentIds = (appointments.results || []).map((apt: any) => apt.id);
      const servicesByAppointment = await getAppointmentServices((c.env as any).DB, appointmentIds);
      const enrichedAppointments = (appointments.results || []).map((apt: any) => ({
        id: apt.id,
        userId: apt.user_id,
        guestName: apt.guest_name,
        guestEmail: apt.guest_email,
        guestPhone: apt.guest_phone,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        description: apt.description,
        createdAt: apt.created_at,
        user: apt.user_id ? { firstName: apt.first_name, lastName: apt.last_name, email: apt.email, phone: apt.user_phone } : undefined,
        services: servicesByAppointment[apt.id] || [],
        isGuest: !apt.user_id,
      }));
      return c.json(enrichedAppointments);
    } catch (error) {
      console.error("Admin appointments error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.put("/api/admin/appointments/:id/status", adminMiddleware, async (c) => {
    try {
      const appointmentId = c.req.param("id");
      const { status } = await c.req.json();
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(status)) return c.json({ error: "Nieprawidłowy status" }, 400);
      const appointment = await (c.env as any).DB.prepare(`SELECT a.*, u.first_name, u.email as user_email FROM appointments a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?`)
        .bind(appointmentId)
        .first();
      if (!appointment) return c.json({ error: "Nie znaleziono wizyty" }, 404);
      await (c.env as any).DB.prepare("UPDATE appointments SET status = ? WHERE id = ?").bind(status, appointmentId).run();
      return c.json({ success: true, message: "Status wizyty został zaktualizowany" });
    } catch (error) {
      console.error("Update appointment status error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.put("/api/admin/appointments/:id", adminMiddleware, async (c) => {
    try {
      const appointmentId = c.req.param("id");
      const { date, time, description, status, services } = await c.req.json();
      if (!date || !time) return c.json({ error: "Data i godzina są wymagane" }, 400);
      const existingAppointment = await (c.env as any).DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled' AND id != ?")
        .bind(date, time, appointmentId)
        .first();
      if (existingAppointment) return c.json({ error: "Ten termin jest już zajęty" }, 400);
      await (c.env as any).DB.prepare("UPDATE appointments SET date = ?, time = ?, description = ?, status = ? WHERE id = ?")
        .bind(date, time, description || "", status || "pending", appointmentId)
        .run();
      if (services && Array.isArray(services)) {
        await (c.env as any).DB.prepare("DELETE FROM appointment_services WHERE appointment_id = ?").bind(appointmentId).run();
        for (const service of services) {
          if (service.id && service.quantity && service.quantity > 0) {
            await (c.env as any).DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, service.id, service.quantity).run();
          }
        }
      }
      return c.json({ success: true, message: "Wizyta została zaktualizowana" });
    } catch (error) {
      console.error("Update appointment error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.delete("/api/admin/appointments/:id", adminMiddleware, async (c) => {
    try {
      const appointmentId = c.req.param("id");
      await (c.env as any).DB.prepare("DELETE FROM appointments WHERE id = ?").bind(appointmentId).run();
      return c.json({ success: true, message: "Wizyta została usunięta" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  // Admin endpoint to mark a user's email as confirmed by email or id
  app.post("/api/admin/confirm-user", adminMiddleware, async (c) => {
    try {
      const body = await c.req.json();
      const { email, id } = body || {};
      if (!email && !id) return c.json({ error: "email lub id jest wymagane" }, 400);

      let user: any = null;
      if (id) {
        user = await (c.env as any).DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
      } else {
        user = await (c.env as any).DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      }
      if (!user) return c.json({ error: "Nie znaleziono użytkownika" }, 404);

      // Try to update latest confirmation record, otherwise insert a confirmed record
      const rec = await (c.env as any).DB.prepare("SELECT id FROM email_confirmations WHERE user_id = ? ORDER BY id DESC LIMIT 1").bind(user.id).first();
      if (rec) {
        await (c.env as any).DB.prepare("UPDATE email_confirmations SET confirmed = 1 WHERE id = ?").bind(rec.id).run();
      } else {
        await (c.env as any).DB.prepare("INSERT INTO email_confirmations (user_id, token, expires_at, confirmed) VALUES (?, ?, ?, 1)").bind(user.id, null, new Date().toISOString()).run();
      }

      return c.json({ success: true, message: "Konto użytkownika zostało potwierdzone" });
    } catch (error) {
      console.error("Admin confirm user error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  // Quick secret-based confirm endpoint (useful when you don't have an admin user configured)
  // Requires header 'x-admin-secret' matching env var ADMIN_SECRET
  app.post("/api/admin/confirm-user-secret", async (c) => {
    try {
      const secret = c.req.header("x-admin-secret") || "";
      const configured = (c.env as any).ADMIN_SECRET || process.env.ADMIN_SECRET;
      if (!configured || secret !== configured) return c.json({ error: "Unauthorized" }, 401);

      const body = await c.req.json();
      const { email, id } = body || {};
      if (!email && !id) return c.json({ error: "email lub id jest wymagane" }, 400);

      let user: any = null;
      if (id) {
        user = await (c.env as any).DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
      } else {
        user = await (c.env as any).DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      }
      if (!user) return c.json({ error: "Nie znaleziono użytkownika" }, 404);

      const rec = await (c.env as any).DB.prepare("SELECT id FROM email_confirmations WHERE user_id = ? ORDER BY id DESC LIMIT 1").bind(user.id).first();
      if (rec) {
        await (c.env as any).DB.prepare("UPDATE email_confirmations SET confirmed = 1 WHERE id = ?").bind(rec.id).run();
      } else {
        await (c.env as any).DB.prepare("INSERT INTO email_confirmations (user_id, token, expires_at, confirmed) VALUES (?, ?, ?, 1)").bind(user.id, null, new Date().toISOString()).run();
      }

      return c.json({ success: true, message: "Konto użytkownika zostało potwierdzone (secret)" });
    } catch (error) {
      console.error("Secret confirm user error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });
}
