import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const appointments = new Hono<CloudflareAppContext>();

const appointmentSchema = z.object({
  date: z.string(),
  time: z.string(),
  description: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
});

// GET /appointments - get all appointments (admin only)
appointments.get("/", authMiddleware(), async (c) => {
  try {
    // Mock data for now
    return c.json([
      {
        id: 1,
        date: "2025-09-25",
        time: "10:00",
        status: "pending",
        guestName: "Jan Kowalski",
        guestEmail: "jan@example.com",
        description: "Cleaning service",
      },
    ]);
  } catch (error) {
    console.error("Get appointments error:", error);
    return c.json({ error: "Failed to get appointments" }, 500);
  }
});

// POST /appointments - create new appointment
appointments.post("/", zValidator("json", appointmentSchema), async (c) => {
  const appointmentData = c.req.valid("json");

  try {
    // Mock creation for now
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    return c.json(
      {
        message: "Appointment created successfully",
        appointment: newAppointment,
      },
      201
    );
  } catch (error) {
    console.error("Create appointment error:", error);
    return c.json({ error: "Failed to create appointment" }, 500);
  }
});

// GET /appointments/services - get available services
appointments.get("/services", async (c) => {
  try {
    return c.json({
      services: [
        { id: 1, name: "Czyszczenie kanapy", price: 150, duration: 120 },
        { id: 2, name: "Czyszczenie fotela", price: 80, duration: 60 },
        { id: 3, name: "Czyszczenie materaca", price: 120, duration: 90 },
        { id: 4, name: "Czyszczenie dywanu", price: 100, duration: 90 },
        { id: 5, name: "Czyszczenie tapicerki samochodowej", price: 200, duration: 150 },
      ],
    });
  } catch (error) {
    console.error("Get services error:", error);
    return c.json({ error: "Failed to get services" }, 500);
  }
});

// GET /appointments/available/:date - get available time slots for date
appointments.get("/available/:date", async (c) => {
  try {
    const date = c.req.param("date");

    // Mock available slots - in real app would check database
    const allSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

    return c.json({
      date,
      availableSlots: allSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    return c.json({ error: "Failed to get available slots" }, 500);
  }
});

// GET /appointments/occupied-dates - get occupied dates
appointments.get("/occupied-dates", async (c) => {
  try {
    // Mock occupied dates - in real app would check database
    const occupiedDates = ["2025-09-25", "2025-09-30", "2025-10-05"];

    return c.json({
      occupiedDates,
    });
  } catch (error) {
    console.error("Get occupied dates error:", error);
    return c.json({ error: "Failed to get occupied dates" }, 500);
  }
});

// POST /appointments/guest - create appointment as guest
appointments.post("/guest", zValidator("json", appointmentSchema), async (c) => {
  const appointmentData = c.req.valid("json");

  try {
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      status: "pending",
      createdAt: new Date().toISOString(),
      isGuest: true,
    };

    return c.json(
      {
        message: "Guest appointment created successfully",
        appointment: newAppointment,
      },
      201
    );
  } catch (error) {
    console.error("Create guest appointment error:", error);
    return c.json({ error: "Failed to create guest appointment" }, 500);
  }
});

export default appointments;
