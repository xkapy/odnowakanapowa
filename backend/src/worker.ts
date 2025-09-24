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

// Database initialization dla Cloudflare D1
import { initCloudflareDatabase } from "./db/cloudflare-database";
import type { CloudflareAppContext } from "./types/cloudflare";

const app = new Hono<CloudflareAppContext>();

// Middleware
app.use("*", logger());
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
