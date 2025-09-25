import type { Hono } from "hono";
import { getAppointmentServices } from "./services";

export default function registerAppointmentsRoutes(app: Hono<any>, authMiddleware: any) {
  app.get("/api/appointments/services", async (c) => {
    try {
      const services = await (c.env as any).DB.prepare("SELECT id, name, price, description FROM services ORDER BY id").all();
      return c.json({ services: services.results || [] });
    } catch (error) {
      console.error("Get services error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  // Public services endpoint (compat for frontend)
  app.get("/api/services", async (c) => {
    try {
      const services = await (c.env as any).DB.prepare("SELECT id, name, price, description FROM services ORDER BY id").all();
      // Return raw array to match frontend expectations
      return c.json(services.results || []);
    } catch (error) {
      console.error("Get services error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.get("/api/appointments/available-times/:date", async (c) => {
    try {
      const date = c.req.param("date");
      const availableTimes = ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
      const bookedAppointments = await c.env.DB.prepare("SELECT time FROM appointments WHERE date = ? AND status != 'cancelled'").bind(date).all();
      const bookedTimes = (bookedAppointments.results || []).map((apt: any) => apt.time);
      const freeTimes = availableTimes.filter((time) => !bookedTimes.includes(time));
      return c.json({ availableTimes: freeTimes });
    } catch (error) {
      console.error("Available times error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.get("/api/appointments/occupied-dates", async (c) => {
    try {
      const endDate = c.req.query("endDate") || "2025-12-31";
      const appointments = await c.env.DB.prepare("SELECT DISTINCT date FROM appointments WHERE date <= ? AND status != 'cancelled' ORDER BY date").bind(endDate).all();
      const occupiedDates = (appointments.results || []).map((apt: any) => apt.date);
      return c.json({ occupiedDates });
    } catch (error) {
      console.error("Occupied dates error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.post("/api/appointments", authMiddleware, async (c: any) => {
    try {
      const userPayload = c.get("user");
      const { date, time, services, serviceIds, comment } = await c.req.json();
      if (!date || !time) return c.json({ error: "Data i godzina są wymagane" }, 400);
      const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'").bind(date, time).first();
      if (existingAppointment) return c.json({ error: "Ten termin jest już zajęty" }, 400);
      const result = await c.env.DB.prepare("INSERT INTO appointments (user_id, date, time, description, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))")
        .bind(userPayload.userId, date, time, comment || "")
        .run();
      const appointmentId = result.meta.last_row_id;
      if (services && Array.isArray(services) && services.length > 0) {
        for (const service of services) {
          try {
            // Cap quantity to 1 for restricted services (ids 301-303)
            const qty = [301, 302, 303].includes(service.id) ? 1 : service.quantity || 1;
            await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, service.id, qty).run();
          } catch (error) {
            console.log("Could not save appointment service:", error);
          }
        }
      } else if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          try {
            await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, serviceId, 1).run();
          } catch (error) {
            console.log("Could not save appointment service:", error);
          }
        }
      }

      return c.json({ success: true, message: "Wizyta została zarezerwowana", appointmentId });
    } catch (error) {
      console.error("Create appointment error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  app.post("/api/appointments/guest", async (c) => {
    try {
      const { date, time, services, serviceIds, comment, guestName, guestEmail, guestPhone } = await c.req.json();
      if (!date || !time || !guestName || !guestEmail || !guestPhone) return c.json({ error: "Wszystkie pola są wymagane" }, 400);
      const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'").bind(date, time).first();
      if (existingAppointment) return c.json({ error: "Ten termin jest już zajęty" }, 400);
      const result = await c.env.DB.prepare(
        "INSERT INTO appointments (guest_name, guest_email, guest_phone, date, time, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))"
      )
        .bind(guestName, guestEmail, guestPhone, date, time, comment || "")
        .run();
      const appointmentId = result.meta.last_row_id;
      if (services && Array.isArray(services) && services.length > 0) {
        for (const service of services) {
          try {
            await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)")
              .bind(appointmentId, service.id, service.quantity || 1)
              .run();
          } catch (error) {
            console.log("Could not save appointment service:", error);
          }
        }
      } else if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          try {
            await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, serviceId, 1).run();
          } catch (error) {
            console.log("Could not save appointment service:", error);
          }
        }
      }

      return c.json({ success: true, message: "Wizyta została zarezerwowana", appointmentId });
    } catch (error) {
      console.error("Create guest appointment error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });
}
