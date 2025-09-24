import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { getDatabase } from "../db/database";
import { sendAppointmentEmail } from "../services/email";
import type { JWTPayload } from "../db/database";
import type { AppContext } from "../types/hono";

const appointments = new Hono<AppContext>();

// Validation schema
const createAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data musi być w formacie YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Czas musi być w formacie HH:MM"),
  serviceIds: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        price: z.string(),
        quantity: z.number(),
      })
    )
    .min(1, "Wybierz co najmniej jedną usługę"),
  comment: z.string().optional(),
});

const createGuestAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data musi być w formacie YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Czas musi być w formacie HH:MM"),
  serviceIds: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        price: z.string(),
        quantity: z.number(),
      })
    )
    .min(1, "Wybierz co najmniej jedną usługę"),
  comment: z.string().optional(),
  guestName: z.string().min(1, "Imię i nazwisko są wymagane"),
  guestEmail: z.string().email("Nieprawidłowy format emaila"),
  guestPhone: z.string().min(9, "Numer telefonu jest wymagany"),
});

// Get occupied dates
appointments.get("/occupied-dates", async (c) => {
  try {
    const endDate = c.req.query("endDate") || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const db = getDatabase();

    // Get all dates that have appointments (one appointment per day maximum)
    const occupiedDatesRows = db
      .query(
        `
        SELECT DISTINCT date
        FROM appointments 
        WHERE date >= DATE('now') AND date <= ? AND status != 'cancelled'
      `
      )
      .all(endDate);

    const occupiedDates: string[] = occupiedDatesRows.map((row: any) => row.date);

    return c.json({ occupiedDates });
  } catch (error) {
    console.error("Get occupied dates error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get available time slots for a date
appointments.get("/available/:date", async (c) => {
  try {
    const date = c.req.param("date");

    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return c.json({ error: "Nieprawidłowy format daty" }, 400);
    }

    const db = getDatabase();

    // Check if date already has any appointment (one appointment per day maximum)
    const existingAppointment = db
      .query(
        `
      SELECT id FROM appointments 
      WHERE date = ? AND status != 'cancelled'
      LIMIT 1
    `
      )
      .get(date);

    // If date is occupied, return empty slots
    if (existingAppointment) {
      return c.json({ availableSlots: [] });
    }

    // Generate available time slots (16:00 - 20:00, every 30 minutes)
    const allSlots = [];
    for (let hour = 16; hour <= 19; hour++) {
      // Add :00 slot
      const timeSlot1 = `${hour.toString().padStart(2, "0")}:00`;
      allSlots.push(timeSlot1);

      // Add :30 slot (except for 20:00)
      if (hour < 20) {
        const timeSlot2 = `${hour.toString().padStart(2, "0")}:30`;
        allSlots.push(timeSlot2);
      }
    }

    // Add 20:00 slot
    allSlots.push("20:00");

    return c.json({ availableSlots: allSlots });
  } catch (error) {
    console.error("Get available slots error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get all services
appointments.get("/services", async (c) => {
  try {
    const db = getDatabase();

    const services = db
      .query(
        `
      SELECT id, name, description, duration, price
      FROM services 
      WHERE active = 1
      ORDER BY name
    `
      )
      .all();

    return c.json({ services });
  } catch (error) {
    console.error("Get services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Create new appointment
appointments.post("/", authMiddleware, async (c) => {
  try {
    const userPayload = c.get("user");
    const body = await c.req.json();
    const { date, time, serviceIds, comment } = createAppointmentSchema.parse(body);

    const db = getDatabase();

    // Check if date already has any appointment (one appointment per day maximum)
    const existingAppointment = db
      .query(
        `
      SELECT id FROM appointments 
      WHERE date = ? AND status != 'cancelled'
    `
      )
      .get(date);

    if (existingAppointment) {
      return c.json({ error: "Ten dzień jest już zajęty. Dostępna jest tylko jedna wizyta dziennie." }, 400);
    }

    // Check if date is not in the past
    const appointmentDate = new Date(`${date}T${time}:00`);
    const now = new Date();

    if (appointmentDate < now) {
      return c.json({ error: "Nie można umówić wizyty w przeszłości" }, 400);
    }

    // Create appointment
    const result = db
      .query(
        `
      INSERT INTO appointments (user_id, date, time, description)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(userPayload.userId, date, time, comment || null);

    const appointmentId = result.lastInsertRowid as number;

    // Insert appointment services with quantities
    for (const service of serviceIds) {
      db.query(`INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)`).run(appointmentId, service.id, service.quantity);
    }

    // Get user details for email
    const user = db
      .query(
        `
      SELECT firstName, lastName, email FROM users WHERE id = ?
    `
      )
      .get(userPayload.userId) as any;

    // Get service names with quantities
    const serviceIds_array = serviceIds.map((s) => s.id);
    const serviceData = db
      .query(
        `
      SELECT name FROM services WHERE id IN (${serviceIds_array.map(() => "?").join(",")})
    `
      )
      .all(...serviceIds_array);

    // Format services with quantities
    const servicesWithQuantity = serviceIds.map((serviceOrder) => {
      const matchingService = serviceData[serviceIds_array.indexOf(serviceOrder.id)];
      const qty = serviceOrder.quantity || 1;
      return qty > 1 ? `${qty}x ${matchingService.name}` : matchingService.name;
    });

    // Send notification email
    try {
      await sendAppointmentEmail({
        to: "odnowakanapowa@gmail.com",
        appointmentDetails: {
          appointmentId,
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          date,
          time,
          services: servicesWithQuantity,
          description: comment || undefined,
        },
        type: "new_appointment",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the appointment creation if email fails
    }

    return c.json({
      message: "Wizyta została umówiona pomyślnie",
      appointmentId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors[0].message }, 400);
    }

    console.error("Create appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Create new appointment as guest
appointments.post("/guest", async (c) => {
  try {
    const body = await c.req.json();
    const { date, time, serviceIds, comment, guestName, guestEmail, guestPhone } = createGuestAppointmentSchema.parse(body);

    const db = getDatabase();

    // Check if date already has any appointment (one appointment per day maximum)
    const existingAppointment = db
      .query(
        `
      SELECT id FROM appointments 
      WHERE date = ? AND status != 'cancelled'
    `
      )
      .get(date);

    if (existingAppointment) {
      return c.json({ error: "Ten dzień jest już zajęty. Dostępna jest tylko jedna wizyta dziennie." }, 400);
    }

    // Check if date is not in the past
    const appointmentDate = new Date(`${date}T${time}:00`);
    const now = new Date();

    if (appointmentDate < now) {
      return c.json({ error: "Nie można umówić wizyty w przeszłości" }, 400);
    }

    // Create appointment for guest (user_id = NULL, is_guest = 1)
    const result = db
      .query(
        `
      INSERT INTO appointments (user_id, date, time, description, is_guest, guest_name, guest_email, guest_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(null, date, time, comment || null, 1, guestName, guestEmail, guestPhone);

    const appointmentId = result.lastInsertRowid as number;

    // Insert appointment services with quantities
    for (const service of serviceIds) {
      db.query(`INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)`).run(appointmentId, service.id, service.quantity);
    }

    // Get service names with quantities
    const serviceIds_array = serviceIds.map((s) => s.id);
    const serviceData = db
      .query(
        `
      SELECT name FROM services WHERE id IN (${serviceIds_array.map(() => "?").join(",")})
    `
      )
      .all(...serviceIds_array);

    // Format services with quantities
    const servicesWithQuantity = serviceIds.map((serviceOrder) => {
      const matchingService = serviceData[serviceIds_array.indexOf(serviceOrder.id)];
      const qty = serviceOrder.quantity || 1;
      return qty > 1 ? `${qty}x ${matchingService.name}` : matchingService.name;
    });

    // Send notification email
    try {
      await sendAppointmentEmail({
        to: "odnowakanapowa@gmail.com",
        appointmentDetails: {
          appointmentId,
          customerName: guestName,
          customerEmail: guestEmail,
          date,
          time,
          services: servicesWithQuantity,
          description: comment || undefined,
        },
        type: "new_appointment",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the appointment creation if email fails
    }

    return c.json({
      message: "Wizyta została umówiona pomyślnie",
      appointmentId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors[0].message }, 400);
    }

    console.error("Create guest appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Cancel appointment
appointments.delete("/:id", authMiddleware, async (c) => {
  try {
    const appointmentId = parseInt(c.req.param("id"));
    const userPayload = c.get("user");

    const db = getDatabase();

    // Check if appointment exists and belongs to user
    const appointment = db
      .query(
        `
      SELECT id, status FROM appointments 
      WHERE id = ? AND userId = ?
    `
      )
      .get(appointmentId, userPayload.userId) as any;

    if (!appointment) {
      return c.json({ error: "Wizyta nie znaleziona" }, 404);
    }

    if (appointment.status === "cancelled") {
      return c.json({ error: "Wizyta jest już anulowana" }, 400);
    }

    // Update appointment status
    db.query(
      `
      UPDATE appointments 
      SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    ).run(appointmentId);

    return c.json({ message: "Wizyta została anulowana" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

export default appointments;
