import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { CloudflareAppContext } from "../types/cloudflare";

const user = new Hono<CloudflareAppContext>();

// GET /user/profile - get user profile
user.get("/profile", authMiddleware(), async (c) => {
  try {
    // Return admin user data
    return c.json({
      id: 1,
      email: "odnowakanapowa@gmail.com",
      firstName: "Adam",
      lastName: "Gembalczyk",
      phone: "785922680",
      isAdmin: true,
      role: "admin",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// PUT /user/profile - update user profile
user.put("/profile", authMiddleware(), async (c) => {
  try {
    const body = await c.req.json();
    console.log("Update profile request:", body);

    // For demo purposes, just return success
    return c.json({
      message: "Profile updated successfully",
      user: {
        id: 1,
        email: body.email || "odnowakanapowa@gmail.com",
        firstName: body.firstName || "Adam",
        lastName: body.lastName || "Gembalczyk",
        phone: body.phone || "785922680",
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// GET /user/appointments - get user appointments
user.get("/appointments", authMiddleware(), async (c) => {
  try {
    // Return empty appointments for now
    return c.json({
      appointments: [],
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    return c.json({ error: "Failed to get appointments" }, 500);
  }
});

// PUT /user/change-password - change user password
user.put("/change-password", authMiddleware(), async (c) => {
  try {
    const body = await c.req.json();
    console.log("Change password request for admin user");

    // For demo purposes, just return success
    return c.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return c.json({ error: "Failed to change password" }, 500);
  }
});

// DELETE /user/delete-profile - delete user profile
user.delete("/delete-profile", authMiddleware(), async (c) => {
  try {
    console.log("Delete profile request for admin user");

    // For demo purposes, just return success
    return c.json({
      message: "Profile deletion requested successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    return c.json({ error: "Failed to delete profile" }, 500);
  }
});

export default user;
