import { z } from "zod";
import type { InfraiClient } from "./infrai_client.ts";

export const appointmentRequest = z.object({
  to: z.string().email(),
  patientFirstName: z.string().min(1),
  appointmentId: z.string().min(1),
  startsAt: z.string().datetime({ offset: true }),
  clinicName: z.string().min(1),
});

export type AppointmentRequest = z.infer<typeof appointmentRequest>;

export function buildAppointmentReminder(input: AppointmentRequest) {
  const body = `Hello ${input.patientFirstName}, your appointment at ${input.clinicName} starts at ${input.startsAt}. Reply to the clinic if you need help.`;
  return {
    to: input.to,
    subject: `Appointment reminder: ${input.clinicName}`,
    body,
    template_vars: {
      patient_first_name: input.patientFirstName,
      appointment_id: input.appointmentId,
      starts_at: input.startsAt,
      clinic_name: input.clinicName,
    },
  };
}

export async function sendAppointmentReminder(client: InfraiClient, raw: unknown) {
  const input = appointmentRequest.parse(raw);
  const message = buildAppointmentReminder(input);
  return client.request<{ message_id: string }>("/v1/email/send", {
    method: "POST",
    body: message,
    idempotencyKey: `appointment-reminder:${input.appointmentId}`,
  });
}
