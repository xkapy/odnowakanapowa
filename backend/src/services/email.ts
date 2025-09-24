import nodemailer from "nodemailer";

interface AppointmentEmailData {
  to: string;
  appointmentDetails: {
    appointmentId?: number;
    date: string;
    time: string;
    services: string[];
    customerName: string;
    customerEmail?: string;
    description?: string;
  };
  type: "new_appointment" | "confirmation" | "admin_notification";
}

// Email configuration
const EMAIL_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "odnowakanapowa@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password", // Use App Password for Gmail
  },
};

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

export const sendAppointmentEmail = async (data: AppointmentEmailData) => {
  try {
    const servicesText = data.appointmentDetails.services.join(", ");

    let subject: string;
    let title: string;
    let content: string;

    switch (data.type) {
      case "confirmation":
        subject = `Potwierdzenie wizyty - Odnowa Kanapowa`;
        title = `Twoja wizyta została potwierdzona!`;
        content = `
          <p>Dzień dobry ${data.appointmentDetails.customerName},</p>
          <p>Miło nam poinformować, że Twoja wizyta została potwierdzona.</p>
        `;
        break;

      case "admin_notification":
        subject = `Potwierdzona wizyta - ${data.appointmentDetails.customerName}`;
        title = `Wizyta została potwierdzona`;
        content = `
          <p>Wizyta została potwierdzona przez administratora.</p>
          ${data.appointmentDetails.customerEmail ? `<p><strong>Email klienta:</strong> ${data.appointmentDetails.customerEmail}</p>` : ""}
        `;
        break;

      default: // new_appointment
        subject = `Nowa wizyta - ${data.appointmentDetails.customerName}`;
        title = `Nowa wizyta została umówiona`;
        content = `
          <p>Nowa wizyta wymaga potwierdzenia.</p>
          ${data.appointmentDetails.customerEmail ? `<p><strong>Email klienta:</strong> ${data.appointmentDetails.customerEmail}</p>` : ""}
        `;
    }

    const mailOptions = {
      from: `"Odnowa Kanapowa" <${EMAIL_CONFIG.auth.user}>`,
      to: data.to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          
          ${content}
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #666;">Szczegóły wizyty</h3>
            
            ${data.appointmentDetails.appointmentId ? `<p><strong>ID wizyty:</strong> #${data.appointmentDetails.appointmentId}</p>` : ""}
            <p><strong>Klient:</strong> ${data.appointmentDetails.customerName}</p>
            <p><strong>Data:</strong> ${formatDate(data.appointmentDetails.date)}</p>
            <p><strong>Godzina:</strong> ${data.appointmentDetails.time}</p>
            <p><strong>Usługi:</strong> ${servicesText}</p>
            
            ${data.appointmentDetails.description ? `<p><strong>Opis:</strong> ${data.appointmentDetails.description}</p>` : ""}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            <p>To jest automatyczna wiadomość z systemu rezerwacji Odnowa Kanapowa.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Test email configuration (optional)
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email server connection verified");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
};

interface ContactEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
}

export const sendContactEmail = async (data: ContactEmailData) => {
  try {
    const subject = `Nowa wiadomość kontaktowa od ${data.firstName} ${data.lastName}`;
    const title = `Nowa wiadomość kontaktowa`;

    const content = `
      <p><strong>Nowa wiadomość kontaktowa</strong></p>
      <p><strong>Od:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ""}
      <p><strong>Wiadomość:</strong></p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${data.message.replace(/\n/g, "<br>")}
      </div>
    `;

    const mailOptions = {
      from: EMAIL_CONFIG.auth.user,
      to: "odnowakanapowa@gmail.com",
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #333; margin: 0; font-size: 24px;">${title}</h1>
          </div>
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${content}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p style="margin: 0; font-size: 14px;">Odnowa Kanapowa</p>
              <p style="margin: 0; font-size: 12px;">Profesjonalne czyszczenie mebli tapicerowanych</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Contact email sent successfully from ${data.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending contact email:", error);
    throw error;
  }
};
