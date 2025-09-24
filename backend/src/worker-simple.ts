import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { CloudflareAppContext } from "./types/cloudflare";

const app = new Hono<CloudflareAppContext>();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "https://odnowa-kanapowa-frontend.pages.dev", "https://odnowakanapowa.pl", "https://www.odnowakanapowa.pl"],
    credentials: true,
  })
);

// Initialize database on first request
app.use("*", async (c, next) => {
  if (!c.env.DATABASE_INITIALIZED) {
    await initCloudflareDatabase(c.env.DB);
    c.env.DATABASE_INITIALIZED = true;
  }
  await next();
});

// Simple routes for testing
app.get("/", (c) => {
  return c.json({
    message: "Odnowa Kanapowa API - Cloudflare Workers",
    status: "running",
    environment: c.env?.ENVIRONMENT || "development",
    version: "1.0.1",
    updated: new Date().toISOString(),
  });
});

app.get("/api/test", (c) => {
  return c.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

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

export default app;
