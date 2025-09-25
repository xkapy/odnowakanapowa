import { D1Database } from "@cloudflare/workers-types";

export const getAppointmentServices = async (db: D1Database, appointmentIds: number[]) => {
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

    const result = await (db as any)
      .prepare(query)
      .bind(...appointmentIds)
      .all();

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

export default getAppointmentServices;
