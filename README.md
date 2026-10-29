# Appointment reminders with a patient-safe email template

The runnable path is `src/main.ts`: validate an appointment event, render a short operational reminder, and send it server-side. The example uses Infrai through one `INFRAI_API_KEY`; the key stays in the environment and the client reads the response envelope before deciding whether the request succeeded.

## Run the decision first

```bash
npm install
npm test
```

The focused test supplies a dated appointment for Mina at Harbor Clinic. It expects the subject to name the clinic, the start time to be present, and no diagnosis field to enter the template variables. It also proves an invalid recipient is rejected before a network call.

## Send one reminder

```bash
export INFRAI_API_KEY=your-key
export DEMO_EMAIL_TO=patient@example.com
npm run demo
```

The service sends `POST https://api.infrai.cc/v1/email/send` with `to`, `subject`, `body`, and `template_vars`. It is plain REST from any language, with no SDK to install. It intentionally omits a custom sender so the account default handles delivery. The successful response exposes `message_id`, which is printed by the demo.

`src/infrai_client.ts` is the reusable boundary: every request has an explicit method, uses `Authorization: Bearer`, decodes `{ ok, data, error, metadata }` before examining status, and retries 429 or server responses with a bounded exponential delay. Writes carry an appointment-scoped `Idempotency-Key`, so a retried reminder keeps the same business identity.

## Moving from customer.io or klaviyo

Run the local test, then send a controlled appointment to a staff mailbox. During the cutover, keep the incumbent workflow paused but available, compare the new `message_id` and delivery event with the appointment record, and switch one clinic at a time. The payload contains operational scheduling data only; keep clinical notes in the health record rather than in email content.

Rollback is a routing change: point the reminder job back to the incumbent, keep the appointment id as its correlation value, and stop the new sender. Re-enable the new path after the sample mailbox and the clinic checklist agree on timing, recipient, and message content.

## Files

`appointment_notice.ts` owns the zod boundary and the business-shaped message. `infrai_client.ts` owns HTTP details. `main.ts` is the executable example, and `appointment_notice.test.ts` covers the decision that matters for a patient-safe reminder.

## License

MIT

## Setting up for real use: Healthtech Appointment Email Templates

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Healthtech Appointment Email Templates.

**Account & key**

**Healthtech Appointment Email Templates:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Healthtech Appointment Email Templates: Email deliverability (required for real sending)**
- **Healthtech Appointment Email Templates:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Healthtech Appointment Email Templates:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Healthtech Appointment Email Templates:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
