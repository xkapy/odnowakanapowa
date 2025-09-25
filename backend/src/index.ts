import { Hono } from "hono";
import { cors } from "hono/cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Types
interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_admin: boolean;
}

const app = new Hono<{ Bindings: Env }>();

// Helper function to get services for appointments
const getAppointmentServices = async (db: D1Database, appointmentIds: number[]) => {
  if (appointmentIds.length === 0) return {};

  try {
    const placeholders = appointmentIds.map(() => "?").join(",");
    const query = `
      SELECT 
        aps.appointment_id,
        aps.quantity,
        s.id,
        s.name,
        s.price,
        s.description
      FROM appointment_services aps
      JOIN services s ON aps.service_id = s.id
      WHERE aps.appointment_id IN (${placeholders})
    `;

    const result = await db
      .prepare(query)
      .bind(...appointmentIds)
      .all();

    // Group services by appointment_id
    const servicesByAppointment: { [key: number]: any[] } = {};
    (result.results || []).forEach((row: any) => {
      if (!servicesByAppointment[row.appointment_id]) {
        servicesByAppointment[row.appointment_id] = [];
      }
      servicesByAppointment[row.appointment_id].push({
        id: row.id,
        name: row.name,
        price: row.price,
        description: row.description,
        quantity: row.quantity || 1,
      });
    });

    return servicesByAppointment;
  } catch (error) {
    console.log("Could not load appointment services (table might not exist):", error);
    return {};
  }
};

// CORS
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://odnowakanapowa.pl", "https://www.odnowakanapowa.pl", "https://odnowakanapowa-frontend-git.pages.dev", "https://*.odnowakanapowa-frontend-git.pages.dev"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    service: "Odnowa Kanapowa API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Get all services
app.get("/api/services", async (c) => {
  try {
    const services = await c.env.DB.prepare("SELECT id, name, price, description FROM services ORDER BY id").all();
    return c.json(services.results || []);
  } catch (error) {
    console.error("Get services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Register
app.post("/api/auth/register", async (c) => {
  try {
    const { email, password, firstName, lastName, phone } = await c.req.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return c.json({ error: "Brakuje wymaganych pól" }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();

    if (existingUser) {
      return c.json({ error: "Użytkownik już istnieje" }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await c.env.DB.prepare(
      `
        INSERT INTO users (email, password, first_name, last_name, phone, is_admin)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    )
      .bind(email, hashedPassword, firstName, lastName, phone || null, false)
      .run();

    if (!result.success) {
      return c.json({ error: "Błąd tworzenia konta" }, 500);
    }

    // Get created user
    const newUser = (await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(result.meta.last_row_id).first()) as User;

    if (!newUser) {
      return c.json({ error: "Błąd pobierania użytkownika" }, 500);
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        isAdmin: newUser.is_admin,
      },
      c.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      success: true,
      message: "Konto utworzone pomyślnie",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        phone: newUser.phone,
        isAdmin: newUser.is_admin,
        role: newUser.is_admin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Login
app.post("/api/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email i hasło są wymagane" }, 400);
    }

    // Get user
    const user = (await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first()) as User;

    if (!user) {
      return c.json({ error: "Nieprawidłowe dane logowania" }, 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: "Nieprawidłowe dane logowania" }, 401);
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      },
      c.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      success: true,
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin,
        role: user.is_admin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Brak autoryzacji" }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, c.env.JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (error) {
    return c.json({ error: "Nieprawidłowy token" }, 401);
  }
};

// Get user profile
app.get("/api/user/profile", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");

    const user = (await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userPayload.userId).first()) as User;

    if (!user) {
      return c.json({ error: "Użytkownik nie znaleziony" }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin,
        role: user.is_admin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get user appointments
app.get("/api/user/appointments", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");

    const appointments = await c.env.DB.prepare("SELECT * FROM appointments WHERE user_id = ? ORDER BY date DESC, time DESC").bind(userPayload.userId).all();

    // Get appointment IDs for loading services
    const appointmentIds = (appointments.results || []).map((apt: any) => apt.id);
    const servicesByAppointment = await getAppointmentServices(c.env.DB, appointmentIds);

    // Format appointments to match frontend expectations
    const formattedAppointments = (appointments.results || []).map((apt: any) => ({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.description,
      createdAt: apt.created_at,
      services: servicesByAppointment[apt.id] || [],
    }));

    return c.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error("User appointments error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  await authMiddleware(c, async () => {});

  const userPayload = c.get("user") as any;
  if (!userPayload?.isAdmin) {
    return c.json({ error: "Brak uprawnień administratora" }, 403);
  }

  await next();
};

// Admin - check access
app.get("/api/admin/check", adminMiddleware, async (c) => {
  return c.json({
    success: true,
    message: "Uprawnienia administratora potwierdzone",
  });
});

// Admin - get all appointments
app.get("/api/admin/appointments", adminMiddleware, async (c) => {
  try {
    const appointments = await c.env.DB.prepare(
      `
        SELECT 
          a.*,
          u.first_name,
          u.last_name,
          u.email,
          u.phone as user_phone
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.date DESC, a.time DESC
      `
    ).all();

    // Get appointment IDs for loading services
    const appointmentIds = (appointments.results || []).map((apt: any) => apt.id);
    const servicesByAppointment = await getAppointmentServices(c.env.DB, appointmentIds);

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
      updatedAt: apt.updated_at,
      user: apt.user_id
        ? {
            firstName: apt.first_name,
            lastName: apt.last_name,
            email: apt.email,
            phone: apt.user_phone,
          }
        : undefined,
      services: servicesByAppointment[apt.id] || [],
      isGuest: !apt.user_id,
    }));

    return c.json(enrichedAppointments);
  } catch (error) {
    console.error("Admin appointments error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get services
app.get("/api/appointments/services", async (c) => {
  try {
    const services = await c.env.DB.prepare("SELECT * FROM services ORDER BY name").all();

    return c.json({ services: services.results || [] });
  } catch (error) {
    console.error("Services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get available time slots
app.get("/api/appointments/available-times/:date", async (c) => {
  try {
    const date = c.req.param("date");

    // Generate time slots from 16:00 to 20:00 every 30 minutes
    const availableTimes = ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

    // Get booked times for this date
    const bookedAppointments = await c.env.DB.prepare("SELECT time FROM appointments WHERE date = ? AND status != 'cancelled'").bind(date).all();

    const bookedTimes = (bookedAppointments.results || []).map((apt: any) => apt.time);

    // Filter out booked times
    const freeTimes = availableTimes.filter((time) => !bookedTimes.includes(time));

    return c.json({ availableTimes: freeTimes });
  } catch (error) {
    console.error("Available times error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Create appointment
app.post("/api/appointments", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");
    const { date, time, services, serviceIds, comment } = await c.req.json();

    // Debug logging
    console.log("[USER] Received appointment data:", { date, time, services, serviceIds, comment });

    if (!date || !time) {
      return c.json({ error: "Data i godzina są wymagane" }, 400);
    }

    // Check if time slot is available
    const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'").bind(date, time).first();

    if (existingAppointment) {
      return c.json({ error: "Ten termin jest już zajęty" }, 400);
    }

    // Create appointment
    const result = await c.env.DB.prepare("INSERT INTO appointments (user_id, date, time, description, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))")
      .bind(userPayload.userId, date, time, comment || "")
      .run();

    const appointmentId = result.meta.last_row_id;

    // Save services if provided (new format with quantity)
    if (services && Array.isArray(services) && services.length > 0) {
      console.log(`[USER] Saving ${services.length} services for appointment ${appointmentId}:`, services);
      for (const service of services) {
        try {
          console.log(`[USER] Saving service: id=${service.id}, quantity=${service.quantity || 1}`);
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)")
            .bind(appointmentId, service.id, service.quantity || 1)
            .run();
          console.log(`[USER] Successfully saved service ${service.id}`);
        } catch (error) {
          console.log("[USER] Could not save appointment service:", error);
        }
      }
    }
    // Backward compatibility with old serviceIds format
    else if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      console.log(`[USER] Saving ${serviceIds.length} serviceIds for appointment ${appointmentId}:`, serviceIds);
      for (const serviceId of serviceIds) {
        try {
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, serviceId, 1).run();
        } catch (error) {
          console.log("[USER] Could not save appointment service:", error);
        }
      }
    } else {
      console.log(`[USER] No services provided for appointment ${appointmentId}`);
    }

    return c.json({
      success: true,
      message: "Wizyta została zarezerwowana",
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Create guest appointment
app.post("/api/appointments/guest", async (c) => {
  try {
    const { date, time, services, serviceIds, comment, guestName, guestEmail, guestPhone } = await c.req.json();

    // Debug logging
    console.log("Received guest appointment data:", { date, time, services, serviceIds, comment, guestName, guestEmail, guestPhone });

    if (!date || !time || !guestName || !guestEmail || !guestPhone) {
      return c.json({ error: "Wszystkie pola są wymagane" }, 400);
    }

    // Check if time slot is available
    const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'").bind(date, time).first();

    if (existingAppointment) {
      return c.json({ error: "Ten termin jest już zajęty" }, 400);
    }

    // Create guest appointment
    const result = await c.env.DB.prepare(
      "INSERT INTO appointments (guest_name, guest_email, guest_phone, date, time, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))"
    )
      .bind(guestName, guestEmail, guestPhone, date, time, comment || "")
      .run();

    const appointmentId = result.meta.last_row_id;

    // Save services if provided (new format with quantity)
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
    }
    // Backward compatibility with old serviceIds format
    else if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        try {
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, serviceId, 1).run();
        } catch (error) {
          console.log("Could not save appointment service:", error);
        }
      }
    }

    return c.json({
      success: true,
      message: "Wizyta została zarezerwowana",
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error("Create guest appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Update user profile
app.put("/api/user/profile", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");
    const { firstName, lastName, email, phone } = await c.req.json();

    if (!firstName || !lastName || !email) {
      return c.json({ error: "Imię, nazwisko i email są wymagane" }, 400);
    }

    // Check if email is already taken by another user
    const existingUser = await c.env.DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?").bind(email, userPayload.userId).first();

    if (existingUser) {
      return c.json({ error: "Ten email jest już używany przez innego użytkownika" }, 400);
    }

    // Update user
    await c.env.DB.prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?")
      .bind(firstName, lastName, email, phone || null, userPayload.userId)
      .run();

    return c.json({
      success: true,
      message: "Profil został zaktualizowany",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin - Update appointment status
app.put("/api/admin/appointments/:id/status", adminMiddleware, async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const { status } = await c.req.json();

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return c.json({ error: "Nieprawidłowy status" }, 400);
    }

    await c.env.DB.prepare("UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(status, appointmentId).run();

    return c.json({
      success: true,
      message: "Status wizyty został zaktualizowany",
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Test endpoint to check appointment services with quantities
app.get("/api/test/appointment/:id/services", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const appointmentIdNum = parseInt(appointmentId);
    const services = await getAppointmentServices(c.env.DB, [appointmentIdNum]);
    return c.json({
      appointmentId: appointmentId,
      services: services[appointmentIdNum] || [],
      allData: services,
    });
  } catch (error) {
    console.error("Test appointment services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Test endpoint to check appointment services
app.get("/api/test/appointment/:id/services", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const appointmentIdNum = parseInt(appointmentId);
    const services = await getAppointmentServices(c.env.DB, [appointmentIdNum]);
    return c.json({
      appointmentId: appointmentId,
      services: services[appointmentIdNum] || [],
      serviceCount: (services[appointmentIdNum] || []).length,
      allData: services,
    });
  } catch (error) {
    console.error("Test appointment services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin - Update appointment details
app.put("/api/admin/appointments/:id", adminMiddleware, async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const { date, time, description, status, services } = await c.req.json();

    console.log("🔄 Updating appointment:", appointmentId, "with data:", { date, time, services });

    if (!date || !time) {
      return c.json({ error: "Data i godzina są wymagane" }, 400);
    }

    // Check if new time slot is available (exclude current appointment)
    const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled' AND id != ?").bind(date, time, appointmentId).first();

    if (existingAppointment) {
      return c.json({ error: "Ten termin jest już zajęty" }, 400);
    }

    // Update appointment basic info
    await c.env.DB.prepare("UPDATE appointments SET date = ?, time = ?, description = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(date, time, description || "", status || "pending", appointmentId)
      .run();

    // Update appointment services if provided
    if (services && Array.isArray(services)) {
      console.log("🔄 Updating services for appointment:", appointmentId, services);
      
      // Delete existing services
      await c.env.DB.prepare("DELETE FROM appointment_services WHERE appointment_id = ?").bind(appointmentId).run();

      // Insert new services
      for (const service of services) {
        if (service.id && service.quantity && service.quantity > 0) {
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)")
            .bind(appointmentId, service.id, service.quantity)
            .run();
          console.log("✅ Added service:", service.id, "quantity:", service.quantity);
        }
      }
    }

    return c.json({
      success: true,
      message: "Wizyta została zaktualizowana",
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin - Delete appointment
app.delete("/api/admin/appointments/:id", adminMiddleware, async (c) => {
  try {
    const appointmentId = c.req.param("id");

    await c.env.DB.prepare("DELETE FROM appointments WHERE id = ?").bind(appointmentId).run();

    return c.json({
      success: true,
      message: "Wizyta została usunięta",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Endpoint nie znaleziony" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Global error:", err);
  return c.json({ error: "Błąd serwera" }, 500);
});

export default app;
