import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { CloudflareAppContext } from "../types/cloudflare";

const contact = new Hono<CloudflareAppContext>();

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

// POST /contact
contact.post("/", zValidator("json", contactSchema), async (c) => {
  const contactData = c.req.valid("json");
  
  try {
    // For now, just log the contact data
    // In production, you'd want to store this in database or send via email service
    console.log("Contact form submission:", contactData);
    
    // You can add Cloudflare Workers email sending here using:
    // - Email Workers API
    // - External email service like SendGrid, Mailgun etc.
    
    return c.json({
      message: "Message sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

export default contact;