import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getDatabase } from "../db/database";
import type { User, JWTPayload } from "../db/database";
import type { AppContext } from "../types/hono";
import bcrypt from "bcryptjs";

const user = new Hono<AppContext>();

// Get current user profile
user.get("/profile", authMiddleware, async (c) => {
  try {
    const userPayload = c.get("user");
    const db = getDatabase();

    const userData = db
      .query(
        `
      SELECT id, email, firstName, lastName, phone, role, createdAt
      FROM users WHERE id = ?
    `
      )
      .get(userPayload.userId) as User | null;

    if (!userData) {
      return c.json({ error: "Użytkownik nie znaleziony" }, 404);
    }

    return c.json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get user appointments
user.get("/appointments", authMiddleware, async (c) => {
  try {
    const userPayload = c.get("user");
    const db = getDatabase();

    const appointments = db
      .query(
        `
        SELECT 
          a.id, 
          a.date, 
          a.time, 
          a.description, 
          a.status, 
          a.created_at,
          GROUP_CONCAT(s.name || '|' || s.price || '|' || ass.quantity) as services_data
        FROM appointments a
        LEFT JOIN appointment_services ass ON a.id = ass.appointment_id
        LEFT JOIN services s ON ass.service_id = s.id
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY a.date DESC, a.time DESC
      `
      )
      .all(userPayload.userId);

    const formattedAppointments = appointments.map((appointment: any) => {
      let services = [];

      if (appointment.services_data) {
        const servicesData = appointment.services_data.split(",");
        services = servicesData.map((serviceData: string) => {
          const [name, price, quantity] = serviceData.split("|");
          return {
            name,
            price,
            quantity: parseInt(quantity) || 1,
          };
        });
      }

      return {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        description: appointment.description,
        status: appointment.status,
        createdAt: appointment.created_at,
        services,
      };
    });

    return c.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error("Get user appointments error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Update user profile
user.put("/profile", authMiddleware, async (c) => {
  try {
    const userPayload = c.get("user");
    const db = getDatabase();
    const body = await c.req.json();

    // Validate and filter allowed fields
    const allowedFields = ["firstName", "lastName", "email", "phone"];
    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ error: "Brak danych do aktualizacji" }, 400);
    }

    // Check if email is unique (if being updated)
    if (updates.email) {
      const existingUser = db.query("SELECT id FROM users WHERE email = ? AND id != ?").get(updates.email, userPayload.userId);

      if (existingUser) {
        return c.json({ error: "Email już istnieje" }, 400);
      }
    }

    // Build dynamic UPDATE query
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    db.query(`UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, userPayload.userId);

    // Get updated user data
    const updatedUser = db
      .query(
        `
      SELECT id, email, firstName, lastName, phone, role, createdAt
      FROM users WHERE id = ?
    `
      )
      .get(userPayload.userId) as User | null;

    return c.json({
      message: "Profil zaktualizowany pomyślnie",
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        phone: updatedUser!.phone,
        role: updatedUser!.role,
        createdAt: updatedUser!.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Change user password
user.put("/change-password", authMiddleware, async (c) => {
  try {
    const userPayload = c.get("user");
    const db = getDatabase();
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: "Wszystkie pola są wymagane" }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: "Nowe hasło musi mieć co najmniej 6 znaków" }, 400);
    }

    // Get current user data
    const userData = db.query("SELECT id, password FROM users WHERE id = ?").get(userPayload.userId) as { id: number; password: string } | null;

    if (!userData) {
      return c.json({ error: "Użytkownik nie znaleziony" }, 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password);
    if (!isValidPassword) {
      return c.json({ error: "Aktualne hasło jest nieprawidłowe" }, 400);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    db.query("UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(hashedNewPassword, userPayload.userId);

    return c.json({ message: "Hasło zostało pomyślnie zmienione" });
  } catch (error) {
    console.error("Change password error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Delete user profile
user.delete("/delete-profile", authMiddleware, async (c) => {
  try {
    const userPayload = c.get("user");
    const db = getDatabase();

    // Delete user's appointments and related data first (foreign key constraints)
    db.query("DELETE FROM appointment_services WHERE appointment_id IN (SELECT id FROM appointments WHERE user_id = ?)").run(userPayload.userId);
    db.query("DELETE FROM appointments WHERE user_id = ?").run(userPayload.userId);

    // Delete the user
    db.query("DELETE FROM users WHERE id = ?").run(userPayload.userId);

    return c.json({ message: "Profil został pomyślnie usunięty" });
  } catch (error) {
    console.error("Delete profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

export default user;
