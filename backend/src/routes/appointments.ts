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
    
    return c.json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    }, 201);
  } catch (error) {
    console.error("Create appointment error:", error);
    return c.json({ error: "Failed to create appointment" }, 500);
  }
});

export default appointments;