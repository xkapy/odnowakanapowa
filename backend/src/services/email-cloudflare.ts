import nodemailer from "nodemailer";

export interface AppointmentEmailData {
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  services: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  description?: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Create email service for Cloudflare Workers
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(emailUser: string, emailPass: string) {
    const EMAIL_CONFIG = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    };

    this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }

  async sendAppointmentEmail(data: AppointmentEmailData) {
    try {
      const servicesHtml = data.services.map((service) => `<li>${service.quantity > 1 ? `${service.quantity}x ` : ""}${service.name} - ${service.price}</li>`).join("");

      const totalServices = data.services.reduce((sum, service) => sum + service.quantity, 0);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .services { background: white; padding: 20px; border-radius: 8px; }
            .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            ul { list-style-type: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            li:last-child { border-bottom: none; }
            .contact-info { margin-top: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Potwierdzenie wizyty</h1>
              <p>Odnowa Kanapowa - Profesjonalne czyszczenie tapicerki</p>
            </div>
            
            <div class="content">
              <p>Dzień dobry <strong>${data.customerName}</strong>,</p>
              <p>Dziękujemy za umówienie wizyty w Odnowa Kanapowa. Oto szczegóły Państwa rezerwacji:</p>
              
              <div class="details">
                <h3>Szczegóły wizyty:</h3>
                <p><strong>Data:</strong> ${data.date}</p>
                <p><strong>Godzina:</strong> ${data.time}</p>
                <p><strong>Liczba usług:</strong> ${totalServices}</p>
                ${data.description ? `<p><strong>Dodatkowe informacje:</strong> ${data.description}</p>` : ""}
              </div>

              <div class="services">
                <h3>Wybrane usługi:</h3>
                <ul>
                  ${servicesHtml}
                </ul>
              </div>

              <p><strong>Co dalej?</strong></p>
              <p>Nasz zespół skontaktuje się z Państwem przed wizytą, aby potwierdzić szczegóły i odpowiedzieć na ewentualne pytania.</p>
              
              <p>W razie pytań prosimy o kontakt:</p>
              <div class="contact-info">
                <p><strong>Email:</strong> odnowakanapowa@gmail.com</p>
                <p><strong>Telefon:</strong> [NUMER_TELEFONU]</p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Odnowa Kanapowa</strong></p>
              <p>Profesjonalne czyszczenie mebli tapicerowanych</p>
              <div class="contact-info">
                <p>Email: odnowakanapowa@gmail.com | Właściciel: Adam Gembalczyk</p>
                <p>Dziękujemy za zaufanie!</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `"Odnowa Kanapowa" <odnowakanapowa@gmail.com>`,
        to: data.customerEmail,
        subject: `Potwierdzenie wizyty - ${data.date} ${data.time}`,
        html: html,
      });

      // Send notification to admin
      await this.transporter.sendMail({
        from: `"Odnowa Kanapowa" <odnowakanapowa@gmail.com>`,
        to: "odnowakanapowa@gmail.com",
        subject: `Nowa wizyta - ${data.customerName}`,
        html: html,
      });

      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async sendContactEmail(data: ContactEmailData) {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .contact-info { margin-top: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nowa wiadomość kontaktowa</h1>
              <p>Odnowa Kanapowa</p>
            </div>
            
            <div class="content">
              <h3>Szczegóły kontaktu:</h3>
              <p><strong>Imię i nazwisko:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Telefon:</strong> ${data.phone}</p>
              
              <div class="message">
                <h3>Wiadomość:</h3>
                <p>${data.message.replace(/\n/g, "<br>")}</p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Odnowa Kanapowa</strong></p>
              <p>Właściciel: Adam Gembalczyk</p>
              <div class="contact-info">
                <p>Email: odnowakanapowa@gmail.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `"${data.name}" <${data.email}>`,
        to: "odnowakanapowa@gmail.com",
        replyTo: data.email,
        subject: `Nowa wiadomość od ${data.name}`,
        html: html,
      });

      return { success: true };
    } catch (error) {
      console.error("Contact email sending error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
}
