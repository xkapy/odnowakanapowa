import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { CloudflareAppContext } from "../types/cloudflare";

const auth = new Hono<CloudflareAppContext>();

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register schema
const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
  phone: z.string().optional(),
});

// POST /auth/login
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    // Admin credentials
    if (email === "odnowakanapowa@gmail.com" && password === "Lunislava_17") {
      return c.json({
        message: "Login successful",
        token: "admin-token-123",
        user: {
          id: 1,
          email: "odnowakanapowa@gmail.com",
          firstName: "Adam",
          lastName: "Gembalczyk",
          phone: "785922680",
          isAdmin: true,
          role: "admin",
        },
      });
    }

    return c.json({ error: "Invalid credentials" }, 401);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /auth/register
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const userData = c.req.valid("json");

  try {
    // For now, just return success - implement database logic later
    return c.json(
      {
        message: "Registration successful",
        user: {
          id: 2,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isAdmin: false,
        },
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default auth;
