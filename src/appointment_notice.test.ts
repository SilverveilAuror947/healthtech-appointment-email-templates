import test from "node:test";
import assert from "node:assert/strict";
import { buildAppointmentReminder, sendAppointmentReminder } from "./appointment_notice.ts";

test("reminder keeps the patient-safe operational fields and omits clinical detail", () => {
  const message = buildAppointmentReminder({
    to: "patient@example.com",
    patientFirstName: "Mina",
    appointmentId: "appt-2048",
    startsAt: "2026-11-04T09:30:00+08:00",
    clinicName: "Harbor Clinic",
  });
  assert.equal(message.subject, "Appointment reminder: Harbor Clinic");
  assert.match(message.body, /2026-11-04T09:30:00\+08:00/);
  assert.equal("diagnosis" in message.template_vars, false);
});

test("request validation rejects an address that cannot receive a notice", async () => {
  const client = { request: async () => { throw new Error("network call should not happen"); } } as never;
  await assert.rejects(() => sendAppointmentReminder(client, {
    to: "not-an-email",
    patientFirstName: "Mina",
    appointmentId: "appt-2048",
    startsAt: "2026-11-04T09:30:00+08:00",
    clinicName: "Harbor Clinic",
  }));
});
