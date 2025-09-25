import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Hono } from "hono";

interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_admin: boolean;
}

export default function registerAuthRoutes(app: Hono<any>) {
  app.post("/api/auth/register", async (c) => {
    try {
      const { email, password, firstName, lastName, phone } = await c.req.json();

      if (!email || !password || !firstName || !lastName) {
        return c.json({ error: "Brakuje wymaganych pól" }, 400);
      }

      const existingUser = await (c.env as any).DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (existingUser) return c.json({ error: "Użytkownik już istnieje" }, 400);

      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await (c.env as any).DB.prepare(`INSERT INTO users (email, password, first_name, last_name, phone, is_admin) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(email, hashedPassword, firstName, lastName, phone || null, false)
        .run();

      if (!result.success) return c.json({ error: "Błąd tworzenia konta" }, 500);

      const newUser = (await (c.env as any).DB.prepare("SELECT * FROM users WHERE id = ?").bind(result.meta.last_row_id).first()) as User;
      if (!newUser) return c.json({ error: "Błąd pobierania użytkownika" }, 500);

      const token = jwt.sign({ userId: newUser.id, email: newUser.email, isAdmin: newUser.is_admin }, (c.env as any).JWT_SECRET, { expiresIn: "7d" });

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

  app.post("/api/auth/login", async (c) => {
    try {
      const { email, password } = await c.req.json();
      if (!email || !password) return c.json({ error: "Email i hasło są wymagane" }, 400);

      const user = (await (c.env as any).DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first()) as User;
      if (!user) return c.json({ error: "Nieprawidłowe dane logowania" }, 401);

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return c.json({ error: "Nieprawidłowe dane logowania" }, 401);

      const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.is_admin }, (c.env as any).JWT_SECRET, { expiresIn: "7d" });

      return c.json({
        success: true,
        message: "Zalogowano pomyślnie",
        token,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone, isAdmin: user.is_admin, role: user.is_admin ? "admin" : "user" },
      });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });
}
