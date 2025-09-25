#!/usr/bin/env node
/* Simple mailer microservice using Express and Nodemailer
   - POST /send with JSON { to, subject, text, html? }
   - Uses SMTP creds from env: ADMIN_EMAIL and ADMIN_EMAIL_APP_PASSWORD
   - Starts on PORT (default 3001)
*/
import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPass = process.env.ADMIN_EMAIL_APP_PASSWORD;
const mailerSecret = process.env.MAILER_SECRET; // expected secret from Worker
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);

if (!adminEmail || !adminPass) {
  console.error("ADMIN_EMAIL and ADMIN_EMAIL_APP_PASSWORD must be set in mailer environment");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: adminEmail,
    pass: adminPass,
  },
});

app.post("/send", async (req, res) => {
  try {
    // If MAILER_SECRET is set, require the header
    if (mailerSecret) {
      const incoming = req.headers["authorization"] || req.headers["x-mailer-secret"];
      const token = typeof incoming === "string" ? (incoming.startsWith("Bearer ") ? incoming.slice(7) : incoming) : undefined;
      if (!token || token !== mailerSecret) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const { to, subject, text, html } = req.body;
    if (!to || !subject || (!text && !html)) return res.status(400).json({ error: "Missing fields (to, subject, text/html)" });
    const info = await transporter.sendMail({ from: adminEmail, to, subject, text, html });
    return res.json({ success: true, info });
  } catch (e) {
    console.error("Mailer error:", e);
    return res.status(500).json({ error: "Mailer error" });
  }
});

app.get("/", (req, res) => res.send("Mailer running"));

app.listen(PORT, () => console.log(`Mailer service listening on port ${PORT}`));
