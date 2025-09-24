import { Hono } from "hono";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { getDatabase } from "../db/database";
import { sendAppointmentEmail } from "../services/email";
import type { JWTPayload } from "../db/database";
import type { AppContext } from "../types/hono";

const admin = new Hono<AppContext>();

// Check admin access (this route needs separate middleware)
admin.get("/check", authMiddleware, adminMiddleware, async (c) => {
  return c.json({ message: "Admin access confirmed" });
});

// All other admin routes require authentication and admin role
admin.use("*", authMiddleware, adminMiddleware);

// Get all appointments
admin.get("/appointments", async (c) => {
  try {
    const db = getDatabase();

    const appointments = db
      .query(
        `
        SELECT 
          a.id,
          a.date,
          a.time,
          a.status,
          a.description,
          a.created_at,
          a.is_guest,
          a.guest_name,
          a.guest_email,
          a.guest_phone,
          u.id as user_id,
          u.email as user_email,
          u.firstName as user_first_name,
          u.lastName as user_last_name,
          GROUP_CONCAT(s.id || '|' || s.name || '|' || s.price || '|' || ass.quantity) as services_data
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        JOIN appointment_services ass ON a.id = ass.appointment_id
        JOIN services s ON ass.service_id = s.id
        GROUP BY a.id
        ORDER BY a.date DESC, a.time DESC
      `
      )
      .all();

    const formattedAppointments = appointments.map((appointment: any) => {
      const servicesData = appointment.services_data.split(",");
      const services = servicesData.map((serviceData: string) => {
        const [id, name, price, quantity] = serviceData.split("|");
        return {
          id: parseInt(id),
          name,
          price,
          quantity: parseInt(quantity) || 1,
        };
      });

      return {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        description: appointment.description,
        isGuest: appointment.is_guest,
        user: appointment.is_guest
          ? {
              id: null,
              email: appointment.guest_email,
              firstName: appointment.guest_name,
              lastName: "",
              phone: appointment.guest_phone,
            }
          : {
              id: appointment.user_id,
              email: appointment.user_email,
              firstName: appointment.user_first_name,
              lastName: appointment.user_last_name,
            },
        services: services,
        createdAt: appointment.created_at,
      };
    });

    return c.json(formattedAppointments);
  } catch (error) {
    console.error("Get admin appointments error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Update appointment status
admin.put("/appointments/:id/status", async (c) => {
  try {
    const appointmentId = parseInt(c.req.param("id"));
    const { status } = await c.req.json();

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return c.json({ error: "Nieprawidłowy status" }, 400);
    }

    const db = getDatabase();

    // Get appointment details for email
    const appointment = db
      .query(
        `
        SELECT 
          a.id,
          a.date,
          a.time,
          a.status as old_status,
          a.description,
          a.is_guest,
          a.guest_name,
          a.guest_email,
          u.email as user_email,
          u.firstName as user_first_name,
          u.lastName as user_last_name,
          GROUP_CONCAT(s.name || '|' || ass.quantity) as services_data
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        JOIN appointment_services ass ON a.id = ass.appointment_id
        JOIN services s ON ass.service_id = s.id
        WHERE a.id = ?
        GROUP BY a.id
      `
      )
      .get(appointmentId);

    if (!appointment) {
      return c.json({ error: "Wizyta nie została znaleziona" }, 404);
    }

    // Update appointment status
    db.query(`UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, appointmentId);

    // Send email notification when appointment is confirmed (async, don't wait)
    if (status === "confirmed" && (appointment as any).old_status !== "confirmed") {
      // Parse services data to include quantities
      const servicesData = (appointment as any).services_data.split(",");
      const servicesWithQuantity = servicesData.map((serviceData: string) => {
        const [name, quantity] = serviceData.split("|");
        const qty = parseInt(quantity) || 1;
        return qty > 1 ? `${qty}x ${name}` : name;
      });

      // Determine customer name and email based on whether it's a guest or regular user
      const isGuest = (appointment as any).is_guest;
      const customerName = isGuest ? (appointment as any).guest_name : `${(appointment as any).user_first_name} ${(appointment as any).user_last_name}`;
      const customerEmail = isGuest ? (appointment as any).guest_email : (appointment as any).user_email;

      // Send emails asynchronously without blocking the response
      (async () => {
        try {
          // Send confirmation email to customer (guest or registered user)
          if (customerEmail) {
            await sendAppointmentEmail({
              to: customerEmail,
              appointmentDetails: {
                date: (appointment as any).date,
                time: (appointment as any).time,
                services: servicesWithQuantity,
                customerName: customerName,
                description: (appointment as any).description,
              },
              type: "confirmation",
            });
          }

          // Also send notification to admin email
          await sendAppointmentEmail({
            to: "odnowakanapowa@gmail.com",
            appointmentDetails: {
              date: (appointment as any).date,
              time: (appointment as any).time,
              services: servicesWithQuantity,
              customerName: customerName,
              customerEmail: customerEmail,
              description: (appointment as any).description,
            },
            type: "admin_notification",
          });
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Don't fail the whole operation if email fails
        }
      })();
    }

    return c.json({
      message: `Status wizyty został zaktualizowany na: ${status}`,
      appointment: {
        id: appointmentId,
        status: status,
      },
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Delete appointment
admin.delete("/appointments/:id", async (c) => {
  try {
    const appointmentId = parseInt(c.req.param("id"));
    console.log("Delete appointment - received ID:", c.req.param("id"), "parsed:", appointmentId);

    if (!appointmentId) {
      console.log("Invalid appointment ID");
      return c.json({ error: "Nieprawidłowe ID wizyty" }, 400);
    }

    const db = getDatabase();

    // Check if appointment exists
    const appointment = db.query("SELECT id FROM appointments WHERE id = ?").get(appointmentId);
    console.log("Found appointment:", appointment);

    if (!appointment) {
      console.log("Appointment not found for ID:", appointmentId);
      return c.json({ error: "Wizyta nie została znaleziona" }, 404);
    }

    // Delete appointment services first (foreign key constraint)
    db.query("DELETE FROM appointment_services WHERE appointment_id = ?").run(appointmentId);

    // Delete the appointment
    db.query("DELETE FROM appointments WHERE id = ?").run(appointmentId);

    return c.json({
      message: "Wizyta została pomyślnie usunięta",
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get all users
admin.get("/users", async (c) => {
  try {
    const db = getDatabase();

    const users = db
      .query(
        `
      SELECT id, email, firstName, lastName, phone, role, createdAt
      FROM users
      ORDER BY createdAt DESC
    `
      )
      .all();

    return c.json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get dashboard stats
admin.get("/stats", async (c) => {
  try {
    const db = getDatabase();

    const totalUsers = db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"').get() as any;
    const totalAppointments = db.query("SELECT COUNT(*) as count FROM appointments").get() as any;
    const pendingAppointments = db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "pending"').get() as any;
    const confirmedAppointments = db.query('SELECT COUNT(*) as count FROM appointments WHERE status = "confirmed"').get() as any;

    // Get recent appointments
    const recentAppointments = db
      .query(
        `
      SELECT 
        a.id, a.date, a.time, a.status,
        u.firstName, u.lastName
      FROM appointments a
      JOIN users u ON a.userId = u.id
      ORDER BY a.createdAt DESC
      LIMIT 5
    `
      )
      .all();

    return c.json({
      stats: {
        totalUsers: totalUsers.count,
        totalAppointments: totalAppointments.count,
        pendingAppointments: pendingAppointments.count,
        confirmedAppointments: confirmedAppointments.count,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Manage services
admin.get("/services", async (c) => {
  try {
    const db = getDatabase();

    const services = db
      .query(
        `
      SELECT id, name, description, duration, price, active, createdAt
      FROM services
      ORDER BY name
    `
      )
      .all();

    return c.json({ services });
  } catch (error) {
    console.error("Get all services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Update service
admin.patch("/services/:id", async (c) => {
  try {
    const serviceId = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { name, description, duration, price, active } = body;

    const db = getDatabase();

    const service = db.query("SELECT id FROM services WHERE id = ?").get(serviceId);

    if (!service) {
      return c.json({ error: "Usługa nie znaleziona" }, 404);
    }

    db.query(
      `
      UPDATE services 
      SET name = ?, description = ?, duration = ?, price = ?, active = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    ).run(name, description, duration, price, active, serviceId);

    return c.json({ message: "Usługa została zaktualizowana" });
  } catch (error) {
    console.error("Update service error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Update appointment
admin.put("/appointments/:id", async (c) => {
  try {
    const appointmentId = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { date, time, services } = body;

    console.log("Update appointment - received data:", { appointmentId, date, time, services });

    if (!date || !time || !services || !Array.isArray(services)) {
      return c.json({ error: "Brakuje wymaganych danych" }, 400);
    }

    const db = getDatabase();

    // Update appointment basic info
    db.query("UPDATE appointments SET date = ?, time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(date, time, appointmentId);

    // Delete existing appointment services
    db.query("DELETE FROM appointment_services WHERE appointment_id = ?").run(appointmentId);

    // Add services (existing and new)
    for (const service of services) {
      console.log("Processing service:", service);

      if (service.id && service.id > 100000) {
        // This is a new service (temporary ID), create it first
        console.log("Creating new service:", service.name, service.price);
        const result = db.query("INSERT INTO services (name, description, duration, price, active) VALUES (?, ?, 60, ?, 1)").run(service.name, `Usługa dodana przez admin`, service.price);

        const newServiceId = result.lastInsertRowid as number;

        // Link to appointment with quantity
        db.query("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").run(appointmentId, newServiceId, service.quantity || 1);
        console.log("Created new service and linked with ID:", newServiceId);
      } else if (service.id) {
        // Existing service with quantity
        console.log("Adding existing service ID:", service.id, "with quantity:", service.quantity || 1);
        db.query("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").run(appointmentId, service.id, service.quantity || 1);
      } else {
        console.log("Service has no ID, skipping:", service);
      }
    }

    return c.json({ message: "Wizyta została zaktualizowana" });
  } catch (error) {
    console.error("Update appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

export default admin;
