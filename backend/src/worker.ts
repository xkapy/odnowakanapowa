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

import type { CloudflareAppContext } from "./types/cloudflare";

// Database initialization function
async function initCloudflareDatabase(db: any) {
  try {
    // Create basic tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        guest_name TEXT,
        guest_email TEXT,
        guest_phone TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

const app = new Hono<CloudflareAppContext>();

// Initialize database on first request
app.use("*", async (c, next) => {
  if (!c.env.DATABASE_INITIALIZED) {
    await initCloudflareDatabase(c.env.DB);
    c.env.DATABASE_INITIALIZED = true;
  }
  await next();
});

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://odnowa-kanapowa-frontend.pages.dev",
      "https://odnowakanapowa.pl",
      "https://www.odnowakanapowa.pl"
    ],
    credentials: true,
  })
);
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://odnowa-kanapowa-frontend.pages.dev", // Cloudflare Pages URL
      "https://odnowakanapowa.pl", // Twoja domena
    ],
    credentials: true,
  })
);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/user", userRoutes);
app.route("/api/appointments", appointmentRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/contact", contactRoutes);

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Odnowa Kanapowa API",
    status: "running",
    environment: c.env?.ENVIRONMENT || "development",
  });
});

// Initialize database on first request
app.use("*", async (c, next) => {
  if (!c.env.DATABASE_INITIALIZED) {
    await initCloudflareDatabase(c.env.DB);
    c.env.DATABASE_INITIALIZED = true;
  }
  await next();
});

export default app;
