import type { Hono } from "hono";
import bcrypt from "bcryptjs";
import { getAppointmentServices } from "./services";

export default function registerUserRoutes(app: Hono<any>, authMiddleware: any) {
  app.get("/api/user/profile", authMiddleware, async (c: any) => {
    try {
      const userPayload = c.get("user");
      const user = (await (c.env as any).DB.prepare("SELECT * FROM users WHERE id = ?").bind(userPayload.userId).first()) as any;
      if (!user) return c.json({ error: "Użytkownik nie znaleziony" }, 404);

      return c.json({
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone, isAdmin: user.is_admin, role: user.is_admin ? "admin" : "user" },
      });
    } catch (error) {
      console.error("Profile error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.get("/api/user/appointments", authMiddleware, async (c: any) => {
    try {
      const userPayload = c.get("user");
      const appointments = await (c.env as any).DB.prepare("SELECT * FROM appointments WHERE user_id = ? ORDER BY date DESC, time DESC").bind(userPayload.userId).all();
      const appointmentIds = (appointments.results || []).map((apt: any) => apt.id);
      const servicesByAppointment = await getAppointmentServices((c.env as any).DB, appointmentIds);
      const formattedAppointments = (appointments.results || []).map((apt: any) => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        description: apt.description,
        // Convert D1/SQLite datetime to ISO string in UTC to avoid local offset issues on frontend
        createdAt: new Date(apt.created_at + "Z").toISOString(),
        services: servicesByAppointment[apt.id] || [],
      }));
      return c.json({ appointments: formattedAppointments });
    } catch (error) {
      console.error("User appointments error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.put("/api/user/profile", authMiddleware, async (c: any) => {
    try {
      const userPayload = c.get("user");
      const { firstName, lastName, email, phone } = await c.req.json();
      if (!firstName || !lastName || !email) return c.json({ error: "Imię, nazwisko i email są wymagane" }, 400);
      const existingUser = await (c.env as any).DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?").bind(email, userPayload.userId).first();
      if (existingUser) return c.json({ error: "Ten email jest już używany przez innego użytkownika" }, 400);
      await (c.env as any).DB.prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?")
        .bind(firstName, lastName, email, phone || null, userPayload.userId)
        .run();
      return c.json({ success: true, message: "Profil został zaktualizowany" });
    } catch (error) {
      console.error("Update profile error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.delete("/api/user/profile", authMiddleware, async (c: any) => {
    try {
      const userPayload = c.get("user");
      const userId = userPayload.userId;
      await (c.env as any).DB.prepare(`DELETE FROM appointment_services WHERE appointment_id IN (SELECT id FROM appointments WHERE user_id = ?)`).bind(userId).run();
      await (c.env as any).DB.prepare("DELETE FROM appointments WHERE user_id = ?").bind(userId).run();
      await (c.env as any).DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
      return c.json({ success: true, message: "Konto zostało usunięte" });
    } catch (error) {
      console.error("Delete user error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.put("/api/user/password", authMiddleware, async (c: any) => {
    try {
      const userPayload = c.get("user");
      const userId = userPayload.userId;
      const { currentPassword, newPassword } = await c.req.json();
      if (!currentPassword || !newPassword) return c.json({ error: "Obecne i nowe hasło są wymagane" }, 400);
      const user = await (c.env as any).DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
      if (!user) return c.json({ error: "Użytkownik nie znaleziony" }, 404);
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return c.json({ error: "Obecne hasło jest nieprawidłowe" }, 400);
      const hashed = await bcrypt.hash(newPassword, 12);
      await (c.env as any).DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(hashed, userId).run();
      return c.json({ success: true, message: "Hasło zostało zmienione" });
    } catch (error) {
      console.error("Change password error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });
}
