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

      // Ensure email_confirmations table exists
      try {
        await (c.env as any).DB.prepare(`
          CREATE TABLE IF NOT EXISTS email_confirmations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT,
            expires_at TEXT,
            confirmed INTEGER DEFAULT 0
          )
        `).run();
      } catch (e) {
        console.warn("Could not create email_confirmations table:", e);
      }

      // Generate confirmation token (JWT) valid for 24h
      const confirmationToken = jwt.sign({ userId: newUser.id, email: newUser.email, type: "email_confirm" }, (c.env as any).JWT_SECRET, { expiresIn: "1d" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Store token
      await (c.env as any).DB.prepare(`INSERT INTO email_confirmations (user_id, token, expires_at, confirmed) VALUES (?, ?, ?, 0)`).bind(newUser.id, confirmationToken, expiresAt).run();

      // Build confirmation URL
      const frontendBase = (c.env as any).FRONTEND_URL || process.env.FRONTEND_URL || "";
      const apiBase = (c.env as any).API_BASE_URL || process.env.API_BASE_URL || "";
      const confirmUrl = apiBase ? `${apiBase.replace(/\/$/, "")}/api/auth/confirm?token=${encodeURIComponent(confirmationToken)}` : `/api/auth/confirm?token=${encodeURIComponent(confirmationToken)}`;

      // Send email via SendGrid if configured, otherwise log confirmation URL
  const sendgridKey = (c.env as any).SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
  const sendinblueKey = (c.env as any).SENDINBLUE_API_KEY || process.env.SENDINBLUE_API_KEY;
  const smtpHost = (c.env as any).SMTP_HOST || process.env.SMTP_HOST;
  const smtpUser = (c.env as any).SMTP_USER || process.env.SMTP_USER;
  const smtpPass = (c.env as any).SMTP_PASS || process.env.SMTP_PASS;
  const smtpPort = (c.env as any).SMTP_PORT || process.env.SMTP_PORT || 587;

  // Preferred order for Workers: SendGrid (API) -> Sendinblue (API) -> Node SMTP (nodemailer)
  if (sendgridKey) {
        try {
          const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sendgridKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email }], subject: "Potwierdź swój adres e-mail" }],
              from: { email: "no-reply@odnowakanapowa.pl", name: "Odnowa Kanapowa" },
              content: [{ type: "text/plain", value: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}` }],
            }),
          });

          if (!sgRes.ok) {
            const text = await sgRes.text().catch(() => "");
            console.warn("SendGrid returned non-OK status:", sgRes.status, text);
            // Also log confirm url so you can still confirm manually
            console.log("Confirmation URL:", confirmUrl);
          }
        } catch (e) {
          console.warn("SendGrid send error:", e);
          // If Sendinblue key exists, try that next (Workers-friendly HTTP API)
          if (sendinblueKey) {
            try {
              const sibRes = await fetch("https://api.sendinblue.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "api-key": sendinblueKey,
                },
                body: JSON.stringify({
                  sender: { name: "Odnowa Kanapowa", email: "no-reply@odnowakanapowa.pl" },
                  to: [{ email }],
                  subject: "Potwierdź swój adres e-mail",
                  textContent: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}`,
                }),
              });
              if (!sibRes.ok) {
                const text = await sibRes.text().catch(() => "");
                console.warn("Sendinblue returned non-OK status:", sibRes.status, text);
                console.log("Confirmation URL:", confirmUrl);
              }
            } catch (e2) {
              console.warn("Sendinblue send error:", e2);
              // attempt nodemailer fallback when possible
              if (smtpHost && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const nodemailer = require("nodemailer");
                  const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: Number(smtpPort),
                    secure: Number(smtpPort) === 465,
                    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
                  });
                  await transporter.sendMail({
                    from: `Odnowa Kanapowa <${smtpUser || "no-reply@odnowakanapowa.pl"}>`,
                    to: email,
                    subject: "Potwierdź swój adres e-mail",
                    text: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}`,
                  });
                } catch (err) {
                  console.warn("Nodemailer fallback failed:", err);
                  console.log("Confirmation URL:", confirmUrl);
                }
              } else {
                console.log("Confirmation URL:", confirmUrl);
              }
            }
          } else if (smtpHost && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
            // No Sendinblue but SMTP configured and we are in Node: use nodemailer
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const nodemailer = require("nodemailer");
              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: Number(smtpPort),
                secure: Number(smtpPort) === 465,
                auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
              });
              await transporter.sendMail({
                from: `Odnowa Kanapowa <${smtpUser || "no-reply@odnowakanapowa.pl"}>`,
                to: email,
                subject: "Potwierdź swój adres e-mail",
                text: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}`,
              });
            } catch (err) {
              console.warn("Nodemailer send error:", err);
              console.log("Confirmation URL:", confirmUrl);
            }
          } else {
            console.log("Confirmation URL:", confirmUrl);
          }
        }
      } else if (sendinblueKey) {
        // No SendGrid, try Sendinblue directly
        try {
          const sibRes = await fetch("https://api.sendinblue.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": sendinblueKey,
            },
            body: JSON.stringify({
              sender: { name: "Odnowa Kanapowa", email: "no-reply@odnowakanapowa.pl" },
              to: [{ email }],
              subject: "Potwierdź swój adres e-mail",
              textContent: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}`,
            }),
          });
          if (!sibRes.ok) {
            const text = await sibRes.text().catch(() => "");
            console.warn("Sendinblue returned non-OK status:", sibRes.status, text);
            console.log("Confirmation URL:", confirmUrl);
          }
        } catch (e) {
          console.warn("Sendinblue send error:", e);
          if (smtpHost && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const nodemailer = require("nodemailer");
              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: Number(smtpPort),
                secure: Number(smtpPort) === 465,
                auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
              });
              await transporter.sendMail({
                from: `Odnowa Kanapowa <${smtpUser || "no-reply@odnowakanapowa.pl"}>`,
                to: email,
                subject: "Potwierdź swój adres e-mail",
                text: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}`,
              });
            } catch (err) {
              console.warn("Nodemailer fallback failed:", err);
              console.log("Confirmation URL:", confirmUrl);
            }
          } else {
            console.log("Confirmation URL:", confirmUrl);
          }
        }
      } else if (smtpHost && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
        // No SendGrid/Sendinblue but SMTP configured and we are in Node: use nodemailer
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const nodemailer = require("nodemailer");
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
          });
          await transporter.sendMail({
            from: `Odnowa Kanapowa <${smtpUser || "no-reply@odnowakanapowa.pl"}>`,
            to: email,
            subject: "Potwierdź swój adres e-mail",
            text: `Dziękujemy za rejestrację. Potwierdź swój e-mail klikając: ${confirmUrl}`,
          });
        } catch (err) {
          console.warn("Nodemailer send error:", err);
          console.log("Confirmation URL:", confirmUrl);
        }
      } else {
        console.log("Confirmation URL:", confirmUrl);
      }

      // Optionally expose confirmation URL in response for debugging/testing
      const debugExpose = (c.env as any).DEBUG_CONFIRM_RESPONSE === "true" || process.env.DEBUG_CONFIRM_RESPONSE === "true";
      const registerPayload: any = { success: true, message: "Konto utworzone. Sprawdź e-mail, aby potwierdzić konto." };
      if (debugExpose) registerPayload.confirmUrl = confirmUrl;
      return c.json(registerPayload);
    } catch (error) {
      console.error("Register error:", error);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });

  // Email confirmation endpoint
  app.get("/api/auth/confirm", async (c) => {
    try {
      const token = c.req.query("token");
      if (!token || typeof token !== "string") return c.text("Brak tokenu", 400);

      // Verify JWT
      try {
        jwt.verify(token, (c.env as any).JWT_SECRET);
      } catch (e) {
        return c.text("Nieprawidłowy lub przeterminowany token", 400);
      }

      // Find confirmation record
      const rec = await (c.env as any).DB.prepare("SELECT * FROM email_confirmations WHERE token = ?").bind(token).first();
      if (!rec) return c.text("Token nie znaleziony", 404);

      // Mark confirmed
      await (c.env as any).DB.prepare("UPDATE email_confirmations SET confirmed = 1 WHERE id = ?").bind(rec.id).run();

      return c.text("E-mail potwierdzony. Możesz teraz się zalogować.");
    } catch (e) {
      console.error("Confirm error:", e);
      return c.text("Błąd serwera", 500);
    }
  });

  app.post("/api/auth/login", async (c) => {
    try {
      const { email, password } = await c.req.json();
      if (!email || !password) return c.json({ error: "Email i hasło są wymagane" }, 400);

      const user = (await (c.env as any).DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first()) as User;
      if (!user) return c.json({ error: "Nieprawidłowe dane logowania" }, 401);
      // Check if email confirmed
      try {
        const rec = await (c.env as any).DB.prepare("SELECT confirmed FROM email_confirmations WHERE user_id = ? ORDER BY id DESC LIMIT 1").bind(user.id).first();
        if (rec && rec.confirmed === 0) {
          return c.json({ error: "Konto nie zostało potwierdzone. Sprawdź e-mail." }, 403);
        }
      } catch (e) {
        // If table doesn't exist or any DB issue, allow login (backward compatible)
      }

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

  // Resend confirmation token (for testing / manual resend). Accepts { email }
  app.post("/api/auth/resend", async (c) => {
    try {
      const { email } = await c.req.json();
      if (!email) return c.json({ error: "Email jest wymagany" }, 400);

      const user = await (c.env as any).DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      if (!user) return c.json({ error: "Nie znaleziono użytkownika" }, 404);

      // Generate confirmation token (JWT) valid for 24h
      const confirmationToken = jwt.sign({ userId: user.id, email: user.email, type: "email_confirm" }, (c.env as any).JWT_SECRET, { expiresIn: "1d" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Store token
      await (c.env as any).DB.prepare(`INSERT INTO email_confirmations (user_id, token, expires_at, confirmed) VALUES (?, ?, ?, 0)`).bind(user.id, confirmationToken, expiresAt).run();

      const apiBase = (c.env as any).API_BASE_URL || process.env.API_BASE_URL || "";
      const confirmUrl = apiBase ? `${apiBase.replace(/\/$/, "")}/api/auth/confirm?token=${encodeURIComponent(confirmationToken)}` : `/api/auth/confirm?token=${encodeURIComponent(confirmationToken)}`;

  const sendgridKey = (c.env as any).SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
  const sendinblueKey2 = (c.env as any).SENDINBLUE_API_KEY || process.env.SENDINBLUE_API_KEY;
  const smtpHost2 = (c.env as any).SMTP_HOST || process.env.SMTP_HOST;
  const smtpUser2 = (c.env as any).SMTP_USER || process.env.SMTP_USER;
  const smtpPass2 = (c.env as any).SMTP_PASS || process.env.SMTP_PASS;
  const smtpPort2 = (c.env as any).SMTP_PORT || process.env.SMTP_PORT || 587;

  if (sendgridKey) {
        try {
          const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sendgridKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email }], subject: "Potwierdź swój adres e-mail" }],
              from: { email: "no-reply@odnowakanapowa.pl", name: "Odnowa Kanapowa" },
              content: [{ type: "text/plain", value: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}` }],
            }),
          });

          if (!sgRes.ok) {
            const text = await sgRes.text().catch(() => "");
            console.warn("SendGrid resend returned non-OK status:", sgRes.status, text);
            console.log("Confirmation URL:", confirmUrl);
          }
        } catch (e) {
          console.warn("SendGrid resend error:", e);
          if (sendinblueKey2) {
            try {
              const sibRes = await fetch("https://api.sendinblue.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "api-key": sendinblueKey2,
                },
                body: JSON.stringify({
                  sender: { name: "Odnowa Kanapowa", email: "no-reply@odnowakanapowa.pl" },
                  to: [{ email }],
                  subject: "Potwierdź swój adres e-mail",
                  textContent: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}`,
                }),
              });
              if (!sibRes.ok) {
                const text = await sibRes.text().catch(() => "");
                console.warn("Sendinblue returned non-OK status:", sibRes.status, text);
                console.log("Confirmation URL:", confirmUrl);
              }
            } catch (e2) {
              console.warn("Sendinblue resend error:", e2);
              if (smtpHost2 && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const nodemailer = require("nodemailer");
                  const transporter = nodemailer.createTransport({
                    host: smtpHost2,
                    port: Number(smtpPort2),
                    secure: Number(smtpPort2) === 465,
                    auth: smtpUser2 && smtpPass2 ? { user: smtpUser2, pass: smtpPass2 } : undefined,
                  });
                  await transporter.sendMail({
                    from: `Odnowa Kanapowa <${smtpUser2 || "no-reply@odnowakanapowa.pl"}>`,
                    to: email,
                    subject: "Potwierdź swój adres e-mail",
                    text: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}`,
                  });
                } catch (err) {
                  console.warn("Nodemailer resend fallback failed:", err);
                  console.log("Confirmation URL:", confirmUrl);
                }
              } else {
                console.log("Confirmation URL:", confirmUrl);
              }
            }
          } else if (smtpHost2 && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const nodemailer = require("nodemailer");
              const transporter = nodemailer.createTransport({
                host: smtpHost2,
                port: Number(smtpPort2),
                secure: Number(smtpPort2) === 465,
                auth: smtpUser2 && smtpPass2 ? { user: smtpUser2, pass: smtpPass2 } : undefined,
              });
              await transporter.sendMail({
                from: `Odnowa Kanapowa <${smtpUser2 || "no-reply@odnowakanapowa.pl"}>`,
                to: email,
                subject: "Potwierdź swój adres e-mail",
                text: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}`,
              });
            } catch (err) {
              console.warn("Nodemailer resend send error:", err);
              console.log("Confirmation URL:", confirmUrl);
            }
          } else {
            console.log("Confirmation URL:", confirmUrl);
          }
        }
      } else if (sendinblueKey2) {
        try {
          const sibRes = await fetch("https://api.sendinblue.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": sendinblueKey2,
            },
            body: JSON.stringify({
              sender: { name: "Odnowa Kanapowa", email: "no-reply@odnowakanapowa.pl" },
              to: [{ email }],
              subject: "Potwierdź swój adres e-mail",
              textContent: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}`,
            }),
          });
          if (!sibRes.ok) {
            const text = await sibRes.text().catch(() => "");
            console.warn("Sendinblue returned non-OK status:", sibRes.status, text);
            console.log("Confirmation URL:", confirmUrl);
          }
        } catch (e) {
          console.warn("Sendinblue resend error:", e);
          if (smtpHost2 && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const nodemailer = require("nodemailer");
              const transporter = nodemailer.createTransport({
                host: smtpHost2,
                port: Number(smtpPort2),
                secure: Number(smtpPort2) === 465,
                auth: smtpUser2 && smtpPass2 ? { user: smtpUser2, pass: smtpPass2 } : undefined,
              });
              await transporter.sendMail({
                from: `Odnowa Kanapowa <${smtpUser2 || "no-reply@odnowakanapowa.pl"}>`,
                to: email,
                subject: "Potwierdź swój adres e-mail",
                text: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}`,
              });
            } catch (err) {
              console.warn("Nodemailer resend fallback failed:", err);
              console.log("Confirmation URL:", confirmUrl);
            }
          } else {
            console.log("Confirmation URL:", confirmUrl);
          }
        }
      } else if (smtpHost2 && typeof process !== "undefined" && (process as any).versions && (process as any).versions.node) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const nodemailer = require("nodemailer");
          const transporter = nodemailer.createTransport({
            host: smtpHost2,
            port: Number(smtpPort2),
            secure: Number(smtpPort2) === 465,
            auth: smtpUser2 && smtpPass2 ? { user: smtpUser2, pass: smtpPass2 } : undefined,
          });
          await transporter.sendMail({
            from: `Odnowa Kanapowa <${smtpUser2 || "no-reply@odnowakanapowa.pl"}>`,
            to: email,
            subject: "Potwierdź swój adres e-mail",
            text: `Dziękujemy. Potwierdź swój e-mail klikając: ${confirmUrl}`,
          });
        } catch (err) {
          console.warn("Nodemailer resend send error:", err);
          console.log("Confirmation URL:", confirmUrl);
        }
      } else {
        console.log("Confirmation URL:", confirmUrl);
      }

      const debugExposeResend = (c.env as any).DEBUG_CONFIRM_RESPONSE === "true" || process.env.DEBUG_CONFIRM_RESPONSE === "true";
      const resendPayload: any = { success: true, message: "Token potwierdzający wysłany (jeśli SendGrid jest skonfigurowany)." };
      if (debugExposeResend) resendPayload.confirmUrl = confirmUrl;
      return c.json(resendPayload);
    } catch (e) {
      console.error("Resend error:", e);
      return c.json({ error: "Błąd serwera" }, 500);
    }
  });
}
