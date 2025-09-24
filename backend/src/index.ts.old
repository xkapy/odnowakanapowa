import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// Routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import appointmentRoutes from "./routes/appointments";
import adminRoutes from "./routes/admin";
import contactRoutes from "./routes/contact";

// Database initialization
import { initDatabase } from "./db/database";
import type { AppContext } from "./types/hono";

const app = new Hono<AppContext>();

// Initialize database
await initDatabase();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Frontend URLs
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Odnowa Kanapowa API",
    version: "1.0.0",
    status: "healthy",
  });
});

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/user", userRoutes);
app.route("/api/appointments", appointmentRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/contact", contactRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Endpoint not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = process.env.PORT || 3001;

console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
