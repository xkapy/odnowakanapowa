import { Hono } from "hono";
import { cors } from "hono/cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Types
interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_EMAIL_APP_PASSWORD: string;
}

interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_admin: boolean;
}

// Email configuration
const createEmailTransporter = (adminEmail: string, appPassword: string) => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmail,
      pass: appPassword,
    },
  });
};

// Email templates
// Email for user - appointment pending approval
const getAppointmentPendingEmail = (firstName: string, date: string, time: string, services: {name: string, price: number, quantity: number}[], total: number) => {
  return {
    subject: 'Rezerwacja złożona - oczekuje na potwierdzenie - Odnowa Kanapowa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">Rezerwacja złożona - Odnowa Kanapowa</h2>
        <p>Dzień dobry ${firstName},</p>
        <p>Dziękujemy za złożenie rezerwacji. Twoja wizyta została zarejestrowana i <strong>oczekuje na potwierdzenie</strong> przez nasz zespół.</p>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Status: Oczekuje na potwierdzenie</h3>
          <p style="color: #856404;">Skontaktujemy się z Tobą wkrótce w celu potwierdzenia terminu.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D5A27; margin-top: 0;">Szczegóły rezerwacji:</h3>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Godzina:</strong> ${time}</p>
          <p><strong>Usługi:</strong></p>
          <ul>
            ${services.map(service => `<li>${service.name} (${service.quantity}x) - ${service.price * service.quantity} zł</li>`).join('')}
          </ul>
          <p><strong>Łączna cena:</strong> ${total} zł</p>
        </div>
        <p>W razie pytań prosimy o kontakt:</p>
        <p><strong>Telefon:</strong> +48 785 922 680</p>
        <p><strong>Email:</strong> odnowakanapowa@gmail.com</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 14px;">
          Wiadomość została wysłana automatycznie. Prosimy nie odpowiadać na ten email.
        </p>
      </div>
    `
  };
};

// Email for user - appointment confirmed
const getAppointmentConfirmationEmail = (firstName: string, date: string, time: string, services: {name: string, price: number, quantity: number}[], total: number) => {
  return {
    subject: 'Wizyta potwierdzona! - Odnowa Kanapowa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">Wizyta potwierdzona! - Odnowa Kanapowa</h2>
        <p>Dzień dobry ${firstName},</p>
        <p><strong>Świetne wieści!</strong> Twoja wizyta została oficjalnie potwierdzona.</p>
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #155724; margin-top: 0;">Status: Potwierdzona</h3>
          <p style="color: #155724;">Twoja wizyta została zatwierdzona. Czekamy na Ciebie!</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D5A27; margin-top: 0;">Szczegóły wizyty:</h3>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Godzina:</strong> ${time}</p>
          <p><strong>Usługi:</strong></p>
          <ul>
            ${services.map(service => `<li>${service.name} (${service.quantity}x) - ${service.price * service.quantity} zł</li>`).join('')}
          </ul>
          <p><strong>Łączna cena:</strong> ${total} zł</p>
        </div>
        <p>W razie pytań prosimy o kontakt:</p>
        <p><strong>Telefon:</strong> +48 785 922 680</p>
        <p><strong>Email:</strong> odnowakanapowa@gmail.com</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 14px;">
          Wiadomość została wysłana automatycznie. Prosimy nie odpowiadać na ten email.
        </p>
      </div>
    `
  };
};

// Email for admin - new appointment notification
const getNewAppointmentNotificationEmail = (customerName: string, customerEmail: string, customerPhone: string | null, date: string, time: string, services: {name: string, price: number, quantity: number}[], total: number, isGuest: boolean = false) => {
  return {
    subject: `Nowa rezerwacja wizyty od ${customerName} - ${date} ${time}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">Nowa rezerwacja wizyty</h2>
        <p>Otrzymano nową rezerwację wizyty, która oczekuje na potwierdzenie w panelu administratora.</p>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Wymagana akcja</h3>
          <p style="color: #856404;">Zaloguj się do panelu administratora, aby potwierdzić lub odrzucić rezerwację.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D5A27; margin-top: 0;">Dane klienta:</h3>
          <p><strong>Imię:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          ${customerPhone ? `<p><strong>Telefon:</strong> ${customerPhone}</p>` : ''}
          <p><strong>Typ konta:</strong> ${isGuest ? 'Gość (bez konta)' : 'Zarejestrowany użytkownik'}</p>
        </div>
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1565c0; margin-top: 0;">Szczegóły wizyty:</h3>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Godzina:</strong> ${time}</p>
          <p><strong>Usługi:</strong></p>
          <ul>
            ${services.map(service => `<li>${service.name} (${service.quantity}x) - ${service.price * service.quantity} zł</li>`).join('')}
          </ul>
          <p><strong>Łączna cena:</strong> ${total} zł</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://odnowakanapowa.pl/admin" style="background-color: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Przejdź do panelu administratora
          </a>
        </div>
        <p style="color: #6c757d; font-size: 14px;">
          Powiadomienie zostało wysłane automatycznie z systemu rezerwacji Odnowa Kanapowa.
        </p>
      </div>
    `
  };
};

const getWelcomeEmail = (firstName: string, email: string) => {
  return {
    subject: 'Witamy w Odnowa Kanapowa!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">Witamy w Odnowa Kanapowa!</h2>
        <p>Dzień dobry ${firstName},</p>
        <p>Dziękujemy za założenie konta w naszym serwisie. Twoje konto zostało pomyślnie utworzone!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D5A27; margin-top: 0;">Dane konta:</h3>
          <p><strong>Email:</strong> ${email}</p>
        </div>
        
        <p>Możesz teraz zalogować się do swojego konta i umówić się na wizytę.</p>
        
        <p>W razie pytań prosimy o kontakt:</p>
        <p>📞 <strong>Telefon:</strong> +48 123 456 789</p>
        <p>📧 <strong>Email:</strong> kontakt@odnowakanapowa.pl</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 14px;">
          Wiadomość została wysłana automatycznie. Prosimy nie odpowiadać na ten email.
        </p>
      </div>
    `
  };
};

const getContactFormEmail = (name: string, email: string, phone: string | undefined, message: string) => {
  return {
    subject: `Nowa wiadomość z formularza kontaktowego od ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">Nowa wiadomość z formularza kontaktowego</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D5A27; margin-top: 0;">Dane nadawcy:</h3>
          <p><strong>Imię i nazwisko:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2D5A27; margin-top: 0;">Treść wiadomości:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="color: #6c757d; font-size: 14px;">
          Wiadomość została wysłana przez formularz kontaktowy na stronie odnowakanapowa.pl
        </p>
      </div>
    `
  };
};

const app = new Hono<{ Bindings: Env }>();

// Helper function to get services for appointments
const getAppointmentServices = async (db: D1Database, appointmentIds: number[]) => {
  if (appointmentIds.length === 0) return {};

  try {
    const placeholders = appointmentIds.map(() => "?").join(",");
    const query = `
      SELECT 
        aps.appointment_id,
        aps.quantity,
        s.id,
        s.name,
        s.price,
        s.description
      FROM appointment_services aps
      JOIN services s ON aps.service_id = s.id
      WHERE aps.appointment_id IN (${placeholders})
    `;

    const result = await db
      .prepare(query)
      .bind(...appointmentIds)
      .all();

    // Group services by appointment_id
    const servicesByAppointment: { [key: number]: any[] } = {};
    (result.results || []).forEach((row: any) => {
      if (!servicesByAppointment[row.appointment_id]) {
        servicesByAppointment[row.appointment_id] = [];
      }
      servicesByAppointment[row.appointment_id].push({
        id: row.id,
        name: row.name,
        price: row.price,
        description: row.description,
        quantity: row.quantity || 1,
      });
    });

    return servicesByAppointment;
  } catch (error) {
    console.log("Could not load appointment services (table might not exist):", error);
    return {};
  }
};

// CORS
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173", 
      "https://odnowakanapowa.pl", 
      "https://www.odnowakanapowa.pl", 
      "https://ok-frontend.pages.dev", 
      "https://*.ok-frontend.pages.dev"
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    service: "Odnowa Kanapowa API",
    version: "2.0.1", // Test auto-deploy
    status: "OK",
  });
});

// Get all services
app.get("/api/services", async (c) => {
  try {
    const services = await c.env.DB.prepare("SELECT id, name, price, description FROM services ORDER BY id").all();
    return c.json(services.results || []);
  } catch (error) {
    console.error("Get services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Register
app.post("/api/auth/register", async (c) => {
  try {
    const { email, password, firstName, lastName, phone } = await c.req.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return c.json({ error: "Brakuje wymaganych pól" }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();

    if (existingUser) {
      return c.json({ error: "Użytkownik już istnieje" }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await c.env.DB.prepare(
      `
        INSERT INTO users (email, password, first_name, last_name, phone, is_admin)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    )
      .bind(email, hashedPassword, firstName, lastName, phone || null, false)
      .run();

    if (!result.success) {
      return c.json({ error: "Błąd tworzenia konta" }, 500);
    }

    // Get created user
    const newUser = (await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(result.meta.last_row_id).first()) as User;

    if (!newUser) {
      return c.json({ error: "Błąd pobierania użytkownika" }, 500);
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        isAdmin: newUser.is_admin,
      },
      c.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send welcome email
    try {
      const transporter = createEmailTransporter(c.env.ADMIN_EMAIL, c.env.ADMIN_EMAIL_APP_PASSWORD);
      const emailTemplate = getWelcomeEmail(newUser.first_name, newUser.email);
      
      await transporter.sendMail({
        from: c.env.ADMIN_EMAIL,
        to: newUser.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
      
      console.log(`Welcome email sent to ${newUser.email}`);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the registration if email fails
    }

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

// Login
app.post("/api/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email i hasło są wymagane" }, 400);
    }

    // Get user
    const user = (await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first()) as User;

    if (!user) {
      return c.json({ error: "Nieprawidłowe dane logowania" }, 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: "Nieprawidłowe dane logowania" }, 401);
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      },
      c.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      success: true,
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin,
        role: user.is_admin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Contact form
app.post("/api/contact", async (c) => {
  try {
    const { name, email, phone, message } = await c.req.json();

    // Validate input
    if (!name || !email || !message) {
      return c.json({ error: "Imię, email i wiadomość są wymagane" }, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Nieprawidłowy adres email" }, 400);
    }

    // Send email to admin
    try {
      const transporter = createEmailTransporter(c.env.ADMIN_EMAIL, c.env.ADMIN_EMAIL_APP_PASSWORD);
      const emailTemplate = getContactFormEmail(name, email, phone, message);
      
      await transporter.sendMail({
        from: c.env.ADMIN_EMAIL,
        to: c.env.ADMIN_EMAIL,
        replyTo: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
      
      console.log(`Contact form email sent from ${email}`);
      
      return c.json({
        success: true,
        message: "Wiadomość została wysłana pomyślnie"
      });
    } catch (emailError) {
      console.error('Error sending contact form email:', emailError);
      return c.json({ error: "Błąd wysyłania wiadomości" }, 500);
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Brak autoryzacji" }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, c.env.JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (error) {
    return c.json({ error: "Nieprawidłowy token" }, 401);
  }
};

// Get user profile
app.get("/api/user/profile", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");

    const user = (await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userPayload.userId).first()) as User;

    if (!user) {
      return c.json({ error: "Użytkownik nie znaleziony" }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin,
        role: user.is_admin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get user appointments
app.get("/api/user/appointments", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");

    const appointments = await c.env.DB.prepare("SELECT * FROM appointments WHERE user_id = ? ORDER BY date DESC, time DESC").bind(userPayload.userId).all();

    // Get appointment IDs for loading services
    const appointmentIds = (appointments.results || []).map((apt: any) => apt.id);
    const servicesByAppointment = await getAppointmentServices(c.env.DB, appointmentIds);

    // Format appointments to match frontend expectations
    const formattedAppointments = (appointments.results || []).map((apt: any) => ({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.description,
      createdAt: apt.created_at,
      services: servicesByAppointment[apt.id] || [],
    }));

    return c.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error("User appointments error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  await authMiddleware(c, async () => {});

  const userPayload = c.get("user") as any;
  if (!userPayload?.isAdmin) {
    return c.json({ error: "Brak uprawnień administratora" }, 403);
  }

  await next();
};

// Admin - check access
app.get("/api/admin/check", adminMiddleware, async (c) => {
  return c.json({
    success: true,
    message: "Uprawnienia administratora potwierdzone",
  });
});

// Admin - get all appointments
app.get("/api/admin/appointments", adminMiddleware, async (c) => {
  try {
    const appointments = await c.env.DB.prepare(
      `
        SELECT 
          a.*,
          u.first_name,
          u.last_name,
          u.email,
          u.phone as user_phone
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.date DESC, a.time DESC
      `
    ).all();

    // Get appointment IDs for loading services
    const appointmentIds = (appointments.results || []).map((apt: any) => apt.id);
    const servicesByAppointment = await getAppointmentServices(c.env.DB, appointmentIds);

    const enrichedAppointments = (appointments.results || []).map((apt: any) => ({
      id: apt.id,
      userId: apt.user_id,
      guestName: apt.guest_name,
      guestEmail: apt.guest_email,
      guestPhone: apt.guest_phone,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      description: apt.description,
      createdAt: apt.created_at,
      user: apt.user_id
        ? {
            firstName: apt.first_name,
            lastName: apt.last_name,
            email: apt.email,
            phone: apt.user_phone,
          }
        : undefined,
      services: servicesByAppointment[apt.id] || [],
      isGuest: !apt.user_id,
    }));

    return c.json(enrichedAppointments);
  } catch (error) {
    console.error("Admin appointments error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get services
app.get("/api/appointments/services", async (c) => {
  try {
    const services = await c.env.DB.prepare("SELECT * FROM services ORDER BY name").all();

    return c.json({ services: services.results || [] });
  } catch (error) {
    console.error("Services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get available time slots
app.get("/api/appointments/available-times/:date", async (c) => {
  try {
    const date = c.req.param("date");

    // Generate time slots from 16:00 to 20:00 every 30 minutes
    const availableTimes = ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

    // Get booked times for this date
    const bookedAppointments = await c.env.DB.prepare("SELECT time FROM appointments WHERE date = ? AND status != 'cancelled'").bind(date).all();

    const bookedTimes = (bookedAppointments.results || []).map((apt: any) => apt.time);

    // Filter out booked times
    const freeTimes = availableTimes.filter((time) => !bookedTimes.includes(time));

    return c.json({ availableTimes: freeTimes });
  } catch (error) {
    console.error("Available times error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Get occupied dates for calendar
app.get("/api/appointments/occupied-dates", async (c) => {
  try {
    const endDate = c.req.query("endDate") || "2025-12-31";

    // Get all dates that have appointments (not cancelled)
    const appointments = await c.env.DB.prepare("SELECT DISTINCT date FROM appointments WHERE date <= ? AND status != 'cancelled' ORDER BY date").bind(endDate).all();

    const occupiedDates = (appointments.results || []).map((apt: any) => apt.date);

    return c.json({ occupiedDates });
  } catch (error) {
    console.error("Occupied dates error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Create appointment
app.post("/api/appointments", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");
    const { date, time, services, serviceIds, comment } = await c.req.json();

    // Debug logging
    console.log("[USER] Received appointment data:", { date, time, services, serviceIds, comment });

    if (!date || !time) {
      return c.json({ error: "Data i godzina są wymagane" }, 400);
    }

    // Check if time slot is available
    const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'").bind(date, time).first();

    if (existingAppointment) {
      return c.json({ error: "Ten termin jest już zajęty" }, 400);
    }

    // Create appointment
    const result = await c.env.DB.prepare("INSERT INTO appointments (user_id, date, time, description, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))")
      .bind(userPayload.userId, date, time, comment || "")
      .run();

    const appointmentId = result.meta.last_row_id;

    // Save services if provided (new format with quantity)
    if (services && Array.isArray(services) && services.length > 0) {
      console.log(`[USER] Saving ${services.length} services for appointment ${appointmentId}:`, services);
      for (const service of services) {
        try {
          console.log(`[USER] Saving service: id=${service.id}, quantity=${service.quantity || 1}`);
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)")
            .bind(appointmentId, service.id, service.quantity || 1)
            .run();
          console.log(`[USER] Successfully saved service ${service.id}`);
        } catch (error) {
          console.log("[USER] Could not save appointment service:", error);
        }
      }
    }
    // Backward compatibility with old serviceIds format
    else if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      console.log(`[USER] Saving ${serviceIds.length} serviceIds for appointment ${appointmentId}:`, serviceIds);
      for (const serviceId of serviceIds) {
        try {
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, serviceId, 1).run();
        } catch (error) {
          console.log("[USER] Could not save appointment service:", error);
        }
      }
    } else {
      console.log(`[USER] No services provided for appointment ${appointmentId}`);
    }

    // Send appointment notification emails
    try {
      // Get user details
      const user = await c.env.DB.prepare("SELECT first_name, email, phone FROM users WHERE id = ?").bind(userPayload.userId).first();
      
      if (user) {
        // Get service names for email
        // Pobierz szczegóły usług z bazy
        let serviceObjs: {name: string, price: number, quantity: number}[] = [];
        let total = 0;
        if (services && Array.isArray(services)) {
          for (const service of services) {
            const serviceResult = await c.env.DB.prepare("SELECT name, price FROM services WHERE id = ?").bind(service.id).first();
            if (serviceResult && typeof serviceResult.name === 'string') {
              const obj = { name: serviceResult.name, price: serviceResult.price, quantity: service.quantity || 1 };
              serviceObjs.push(obj);
              total += obj.price * obj.quantity;
            }
          }
        } else if (serviceIds && Array.isArray(serviceIds)) {
          for (const serviceId of serviceIds) {
            const serviceResult = await c.env.DB.prepare("SELECT name, price FROM services WHERE id = ?").bind(serviceId).first();
            if (serviceResult && typeof serviceResult.name === 'string') {
              const obj = { name: serviceResult.name, price: serviceResult.price, quantity: 1 };
              serviceObjs.push(obj);
              total += obj.price;
            }
          }
        }
        const transporter = createEmailTransporter(c.env.ADMIN_EMAIL, c.env.ADMIN_EMAIL_APP_PASSWORD);
        // Send pending email to user
        const userEmailTemplate = getAppointmentPendingEmail(user.first_name, date, time, serviceObjs, total);
        await transporter.sendMail({
          from: c.env.ADMIN_EMAIL,
          to: user.email,
          subject: userEmailTemplate.subject,
          html: userEmailTemplate.html,
        });
        // Send notification to admin
        const adminEmailTemplate = getNewAppointmentNotificationEmail(
          user.first_name,
          user.email,
          user.phone || null,
          date,
          time,
          serviceObjs,
          total,
          false // not a guest
        );
        await transporter.sendMail({
          from: c.env.ADMIN_EMAIL,
          to: c.env.ADMIN_EMAIL,
          subject: adminEmailTemplate.subject,
          html: adminEmailTemplate.html,
        });
        console.log(`Appointment pending email sent to ${user.email} and notification sent to admin`);
      }
    } catch (emailError) {
      console.error('Error sending appointment notification emails:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return c.json({
      success: true,
      message: "Wizyta została zarezerwowana",
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Create guest appointment
app.post("/api/appointments/guest", async (c) => {
  try {
    const { date, time, services, serviceIds, comment, guestName, guestEmail, guestPhone } = await c.req.json();

    // Debug logging
    console.log("Received guest appointment data:", { date, time, services, serviceIds, comment, guestName, guestEmail, guestPhone });

    if (!date || !time || !guestName || !guestEmail || !guestPhone) {
      return c.json({ error: "Wszystkie pola są wymagane" }, 400);
    }

    // Check if time slot is available
    const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'").bind(date, time).first();

    if (existingAppointment) {
      return c.json({ error: "Ten termin jest już zajęty" }, 400);
    }

    // Create guest appointment
    const result = await c.env.DB.prepare(
      "INSERT INTO appointments (guest_name, guest_email, guest_phone, date, time, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))"
    )
      .bind(guestName, guestEmail, guestPhone, date, time, comment || "")
      .run();

    const appointmentId = result.meta.last_row_id;

    // Save services if provided (new format with quantity)
    if (services && Array.isArray(services) && services.length > 0) {
      for (const service of services) {
        try {
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)")
            .bind(appointmentId, service.id, service.quantity || 1)
            .run();
        } catch (error) {
          console.log("Could not save appointment service:", error);
        }
      }
    }
    // Backward compatibility with old serviceIds format
    else if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        try {
          await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)").bind(appointmentId, serviceId, 1).run();
        } catch (error) {
          console.log("Could not save appointment service:", error);
        }
      }
    }

    // Send appointment notification emails to guest and admin
    try {
      // Get service names for email
      // Pobierz szczegóły usług z bazy
      let serviceObjs: {name: string, price: number, quantity: number}[] = [];
      let total = 0;
      if (services && Array.isArray(services)) {
        for (const service of services) {
          const serviceResult = await c.env.DB.prepare("SELECT name, price FROM services WHERE id = ?").bind(service.id).first();
          if (serviceResult && typeof serviceResult.name === 'string') {
            const obj = { name: serviceResult.name, price: Number(serviceResult.price), quantity: service.quantity || 1 };
            serviceObjs.push(obj);
            total += obj.price * obj.quantity;
          }
        }
      } else if (serviceIds && Array.isArray(serviceIds)) {
        for (const serviceId of serviceIds) {
          const serviceResult = await c.env.DB.prepare("SELECT name, price FROM services WHERE id = ?").bind(serviceId).first();
          if (serviceResult && typeof serviceResult.name === 'string') {
            const obj = { name: serviceResult.name, price: Number(serviceResult.price), quantity: 1 };
            serviceObjs.push(obj);
            total += obj.price;
          }
        }
      }
      const transporter = createEmailTransporter(c.env.ADMIN_EMAIL, c.env.ADMIN_EMAIL_APP_PASSWORD);
      // Send pending email to guest
      const guestEmailTemplate = getAppointmentPendingEmail(guestName.split(' ')[0], date, time, serviceObjs, total);
      await transporter.sendMail({
        from: c.env.ADMIN_EMAIL,
        to: guestEmail,
        subject: guestEmailTemplate.subject,
        html: guestEmailTemplate.html,
      });
      // Send notification to admin
      const adminEmailTemplate = getNewAppointmentNotificationEmail(
        guestName,
        guestEmail,
        guestPhone,
        date,
        time,
        serviceObjs,
        total,
        true // is a guest
      );
      await transporter.sendMail({
        from: c.env.ADMIN_EMAIL,
        to: c.env.ADMIN_EMAIL,
        subject: adminEmailTemplate.subject,
        html: adminEmailTemplate.html,
      });
      console.log(`Guest appointment pending email sent to ${guestEmail} and notification sent to admin`);
    } catch (emailError) {
      console.error('Error sending guest appointment notification emails:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return c.json({
      success: true,
      message: "Wizyta została zarezerwowana",
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error("Create guest appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Update user profile
app.put("/api/user/profile", authMiddleware, async (c: any) => {
  try {
    const userPayload = c.get("user");
    const { firstName, lastName, email, phone } = await c.req.json();

    if (!firstName || !lastName || !email) {
      return c.json({ error: "Imię, nazwisko i email są wymagane" }, 400);
    }

    // Check if email is already taken by another user
    const existingUser = await c.env.DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?").bind(email, userPayload.userId).first();

    if (existingUser) {
      return c.json({ error: "Ten email jest już używany przez innego użytkownika" }, 400);
    }

    // Update user
    await c.env.DB.prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?")
      .bind(firstName, lastName, email, phone || null, userPayload.userId)
      .run();

    return c.json({
      success: true,
      message: "Profil został zaktualizowany",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin - Update appointment status
app.put("/api/admin/appointments/:id/status", adminMiddleware, async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const { status } = await c.req.json();

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return c.json({ error: "Nieprawidłowy status" }, 400);
    }

    // Get appointment details before updating
    const appointment = await c.env.DB.prepare(
      `SELECT 
        a.*, 
        u.first_name, 
        u.email as user_email
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`
    ).bind(appointmentId).first();

    if (!appointment) {
      return c.json({ error: "Nie znaleziono wizyty" }, 404);
    }

    // Update status
    await c.env.DB.prepare("UPDATE appointments SET status = ? WHERE id = ?").bind(status, appointmentId).run();

    // Send confirmation email if status changed to "confirmed"
    if (status === "confirmed") {
      try {
        // Get service names for email
        const appointmentIdNum = parseInt(appointmentId);
        const servicesData = await getAppointmentServices(c.env.DB, [appointmentIdNum]);
        const appointmentServices = servicesData[appointmentIdNum] || [];
        // Przygotuj szczegóły usług i sumę
        const serviceObjs: {name: string, price: number, quantity: number}[] = (appointmentServices || []).map((service: any) => ({
          name: service.name,
          price: service.price,
          quantity: service.quantity
        }));
        const total = serviceObjs.reduce((sum, s) => sum + s.price * s.quantity, 0);
        const transporter = createEmailTransporter(c.env.ADMIN_EMAIL, c.env.ADMIN_EMAIL_APP_PASSWORD);
        // Determine recipient email and name
        const recipientEmail = (appointment.user_email || appointment.guest_email) as string;
        const guestName = appointment.guest_name as string;
        const firstName = appointment.first_name as string;
        const recipientName = firstName || (guestName ? guestName.split(' ')[0] : 'Klient');
        if (recipientEmail) {
          const emailTemplate = getAppointmentConfirmationEmail(
            recipientName,
            appointment.date as string,
            appointment.time as string,
            serviceObjs,
            total
          );
          await transporter.sendMail({
            from: c.env.ADMIN_EMAIL,
            to: recipientEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
          console.log(`Appointment confirmation email sent to ${recipientEmail} after admin approval`);
        }
      } catch (emailError) {
        console.error('Error sending appointment confirmation email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    return c.json({
      success: true,
      message: "Status wizyty został zaktualizowany",
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Test endpoint to check appointment services
app.get("/api/test/appointment/:id/services", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const appointmentIdNum = parseInt(appointmentId);
    const services = await getAppointmentServices(c.env.DB, [appointmentIdNum]);
    return c.json({
      appointmentId: appointmentId,
      services: services[appointmentIdNum] || [],
      serviceCount: (services[appointmentIdNum] || []).length,
      allData: services,
    });
  } catch (error) {
    console.error("Test appointment services error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// Admin - Update appointment details
app.put("/api/admin/appointments/:id", adminMiddleware, async (c) => {
  try {
    console.log("🚀 PUT request received for appointment ID:", c.req.param("id"));

    const appointmentId = c.req.param("id");
    const requestBody = await c.req.json();
    const { date, time, description, status, services } = requestBody;

    console.log("📝 Full request body:", JSON.stringify(requestBody));
    console.log("🔄 Parsed values:", { date, time, description, status, services });

    if (!date || !time) {
      console.log("❌ Missing date or time");
      return c.json({ error: "Data i godzina są wymagane" }, 400);
    }

    console.log("⏰ Checking time slot availability...");
    // Check if new time slot is available (exclude current appointment)
    const existingAppointment = await c.env.DB.prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled' AND id != ?").bind(date, time, appointmentId).first();

    if (existingAppointment) {
      console.log("❌ Time slot already taken:", existingAppointment);
      return c.json({ error: "Ten termin jest już zajęty" }, 400);
    }

    console.log("✅ Time slot is available, proceeding with update...");
    // Update appointment basic info
    const updateResult = await c.env.DB.prepare("UPDATE appointments SET date = ?, time = ?, description = ?, status = ? WHERE id = ?")
      .bind(date, time, description || "", status || "pending", appointmentId)
      .run();

    console.log("✅ Basic update result:", updateResult);

    // Update appointment services if provided
    if (services && Array.isArray(services)) {
      console.log("🔄 About to update services for appointment:", appointmentId, "Services:", JSON.stringify(services));

      // Delete existing services
      console.log("🗑️ Deleting existing services...");
      const deleteResult = await c.env.DB.prepare("DELETE FROM appointment_services WHERE appointment_id = ?").bind(appointmentId).run();
      console.log("✅ Delete result:", deleteResult);

      // Insert new services
      console.log("➕ Inserting new services...");
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        console.log(`➕ Processing service ${i + 1}/${services.length}:`, JSON.stringify(service));

        if (service.id && service.quantity && service.quantity > 0) {
          console.log(`➕ About to insert service: ${service.id}, quantity: ${service.quantity}`);
          const insertResult = await c.env.DB.prepare("INSERT INTO appointment_services (appointment_id, service_id, quantity) VALUES (?, ?, ?)")
            .bind(appointmentId, service.id, service.quantity)
            .run();
          console.log("✅ Insert result:", insertResult);
        } else {
          console.log("⏭️ Skipping service (invalid data):", JSON.stringify(service));
        }
      }
    } else {
      console.log("🔄 No services provided or services is not array");
    }

    console.log("🎉 Update completed successfully");
    return c.json({
      success: true,
      message: "Wizyta została zaktualizowana",
    });
  } catch (error) {
    console.error("❌ Update appointment error:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
    return c.json({ error: "Błąd serwera: " + (error instanceof Error ? error.message : String(error)) }, 500);
  }
});

// Admin - Delete appointment
app.delete("/api/admin/appointments/:id", adminMiddleware, async (c) => {
  try {
    const appointmentId = c.req.param("id");

    await c.env.DB.prepare("DELETE FROM appointments WHERE id = ?").bind(appointmentId).run();

    return c.json({
      success: true,
      message: "Wizyta została usunięta",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return c.json({ error: "Błąd serwera" }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Endpoint nie znaleziony" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Global error:", err);
  return c.json({ error: "Błąd serwera" }, 500);
});

export default app;
