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
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      isAdmin: user.is_admin,
      role: user.is_admin ? "admin" : "user",
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

    // Format appointments to match frontend expectations
    const formattedAppointments = (appointments.results || []).map((apt: any) => ({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.description,
      createdAt: apt.created_at,
      services: [], // Empty array to prevent frontend errors
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
      services: [], // TODO: Add services later
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
