import { infrai } from "./infrai_client.ts";
import { sendAppointmentReminder } from "./appointment_notice.ts";

const to = process.env.DEMO_EMAIL_TO;
if (!to) throw new Error("DEMO_EMAIL_TO is required");

const result = await sendAppointmentReminder(infrai(), {
  to,
  patientFirstName: "Mina",
  appointmentId: "appt-2048",
  startsAt: "2026-11-04T09:30:00+08:00",
  clinicName: "Harbor Clinic",
});
console.log(`appointment reminder sent: ${result.message_id}`);
