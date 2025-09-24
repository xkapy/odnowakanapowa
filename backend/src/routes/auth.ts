import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDatabase } from "../db/database";
import { generateToken } from "../middleware/auth";
import type { User } from "../db/database";

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

// Register endpoint
auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, firstName, lastName, phone } = registerSchema.parse(body);

    const db = getDatabase();

    // Check if user already exists
    const existingUser = db.query("SELECT id FROM users WHERE email = ?").get(email) as User | null;

    if (existingUser) {
      return c.json({ error: "Użytkownik z tym emailem już istnieje" }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db
      .query(
        `
      INSERT INTO users (email, password, firstName, lastName, phone)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(email, hashedPassword, firstName, lastName, phone || null);

    const userId = result.lastInsertRowid as number;

    // Generate token
    const token = generateToken({
      userId,
      email,
      role: "user",
    });

    return c.json({
      message: "Konto zostało utworzone pomyślnie",
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        phone,
        role: "user",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors[0].message }, 400);
    }

    console.error("Register error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Login endpoint
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);

    const db = getDatabase();

    // Find user
    const user = db
      .query(
        `
      SELECT id, email, password, firstName, lastName, phone, role
      FROM users WHERE email = ?
    `
      )
      .get(email) as User | null;

    if (!user) {
      return c.json({ error: "Nieprawidłowy email lub hasło" }, 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return c.json({ error: "Nieprawidłowy email lub hasło" }, 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors[0].message }, 400);
    }

    console.error("Login error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Logout endpoint (client-side token removal)
auth.post("/logout", (c) => {
  return c.json({ message: "Wylogowano pomyślnie" });
});

export default auth;
