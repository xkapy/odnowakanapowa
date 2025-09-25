import { Hono } from "hono";
import registerAuthRoutes from "./auth";
import registerUserRoutes from "./user";
import registerAppointmentsRoutes from "./appointments";
import registerAdminRoutes from "./admin";
import { corsMiddleware, authMiddleware as authMwFactory, adminMiddleware as adminMwFactory } from "./middleware";

// Types
interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Attach dynamic CORS for Pages and known origins
app.use("*", corsMiddleware());

// Health check
app.get("/", (c) => {
  return c.json({ service: "Odnowa Kanapowa API", version: "2.0.0", timestamp: new Date().toISOString() });
});

// Create runtime wrappers so middleware factories can access c.env.JWT_SECRET
const authMiddleware = async (c: any, next: any) => {
  return authMwFactory((c.env as any).JWT_SECRET)(c, next);
};

const adminMiddleware = async (c: any, next: any) => {
  return adminMwFactory((c.env as any).JWT_SECRET)(c, next);
};

// Register modular routes
registerAuthRoutes(app);
registerUserRoutes(app, authMiddleware);
registerAppointmentsRoutes(app, authMiddleware);
registerAdminRoutes(app, adminMiddleware);

// 404 and error handlers
app.notFound((c) => {
  return c.json({ error: "Endpoint nie znaleziony" }, 404);
});

app.onError((err, c) => {
  console.error("Global error:", err);
  return c.json({ error: "Błąd serwera" }, 500);
});

export default app;
