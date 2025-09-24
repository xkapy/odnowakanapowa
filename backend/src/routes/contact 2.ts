import { Hono } from "hono";
import { sendContactEmail } from "../services/email";
import { authMiddleware } from "../middleware/auth";
import { getDatabase } from "../db/database";
import type { AppContext } from "../types/hono";

const contact = new Hono<AppContext>();

// Send contact message
contact.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { firstName, lastName, email, phone, message } = body;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
      return c.json({ error: "Wszystkie pola oprócz telefonu są wymagane" }, 400);
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return c.json({ error: "Nieprawidłowy format adresu email" }, 400);
    }

    // Validate phone if provided
    if (phone?.trim()) {
      if (!/^(?:\+\d{1,3} \d{9}|\+\d{1,3}\s?\d{3}\s?\d{3}\s?\d{3}|\+\d{1,3} \d{3} \d{3} \d{3}|\d{9}|\d{3} \d{3} \d{3})$/.test(phone.trim())) {
        return c.json({ error: "Nieprawidłowy format numeru telefonu" }, 400);
      }
    }

    // Send email
    const emailSent = await sendContactEmail({
      firstName,
      lastName,
      email,
      phone: phone || null,
      message,
    });

    if (!emailSent) {
      return c.json({ error: "Nie udało się wysłać wiadomości" }, 500);
    }

    return c.json({ message: "Wiadomość została wysłana pomyślnie" });
  } catch (error) {
    console.error("Contact error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get user data for logged in users (to pre-fill form)
contact.get("/user-data", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const db = getDatabase();

    const userData = db.query("SELECT firstName, lastName, email, phone FROM users WHERE id = ?").get(user.userId) as any;

    if (!userData) {
      return c.json({ error: "Użytkownik nie znaleziony" }, 404);
    }

    return c.json({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone || "",
    });
  } catch (error) {
    console.error("Get user data error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

export default contact;
