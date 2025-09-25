import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

const app = express();
app.use(bodyParser.json());

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_HOST) {
  console.warn("[mailer] No SMTP_HOST configured — mailer will fail until env vars are set.");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

app.post("/send", async (req, res) => {
  try {
    const { to, subject, text, html, from } = req.body;
    if (!to || !subject || (!text && !html)) return res.status(400).json({ error: "to, subject and text/html are required" });

    const mailOptions = {
      from: from || (SMTP_USER ? SMTP_USER : 'no-reply@odnowakanapowa.pl'),
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[mailer] sent", info);
    return res.json({ success: true, info });
  } catch (err) {
    console.error("[mailer] send error:", err);
    return res.status(500).json({ error: "Send error", details: err?.toString?.() });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`[mailer] listening on http://localhost:${port}`));
