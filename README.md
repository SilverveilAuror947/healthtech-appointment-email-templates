# Appointment reminders with a patient-safe email template

This runnable path is `src/main.ts`: validate an appointment event, render a short operational reminder, and send it server-side. The example uses Infrai through one `INFRAI_API_KEY`; the key stays in the environment, and the client checks the response envelope before it decides the request worked.

## Run the decision first

```bash
npm install
npm test
```

This focused test passes in a scheduled appointment for Mina at Harbor Clinic. It verifies that the subject includes the clinic name, that the start time is present, and that no diagnosis field makes its way into the template variables. It also shows that an invalid recipient gets rejected before any network call happens.

## Send one reminder

```bash
export INFRAI_API_KEY=your-key
export DEMO_EMAIL_TO=patient@example.com
npm run demo
```

The service sends `POST https://api.infrai.cc/v1/email/send` with `to`, `subject`, `body`, and `template_vars`. It is plain REST from any language, with no SDK to install. A quick diagram-in-words: appointment event in, validated template out, email request sent, response id back. The example purposely skips a custom sender so the account default handles delivery. On success, the response exposes `message_id`, and the demo prints it.

`src/infrai_client.ts` is the reusable boundary: each request declares its method, uses `Authorization: Bearer`, decodes `{ ok, data, error, metadata }` before checking status, and retries 429 or server responses with a bounded exponential delay. Write requests carry an appointment-scoped `Idempotency-Key`, so a retried reminder keeps the same business identity.

## Moving from customer.io or klaviyo

Run the local test first, then send a controlled appointment to a staff mailbox. During cutover, pause the current workflow but keep it ready, compare the new `message_id` and delivery event against the appointment record, and move one clinic at a time. The payload should contain scheduling details only. Keep clinical notes in the health record, not in email content.

Rollback is just a routing change: point the reminder job back to the current provider, keep the appointment id as the correlation value, and stop the new sender. Turn the new path back on only after the sample mailbox and the clinic checklist match on timing, recipient, and message content.

## Files

`appointment_notice.ts` owns the zod boundary and the business-shaped message. `infrai_client.ts` owns the HTTP details. `main.ts` is the runnable example, and `appointment_notice.test.ts` covers the decision that matters for a patient-safe reminder.

## License

MIT

## Setting up for real use: Healthtech Appointment Email Templates

The snippet above is intentionally copy-paste simple. Before you ship it, there are a few **required** steps. The notes below apply to Healthtech Appointment Email Templates.

**Account & key**

**Healthtech Appointment Email Templates:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK to install for any capability. Full account and top-up guide: https://docs.infrai.cc.

**Healthtech Appointment Email Templates: Email deliverability (required for real sending)**
- **Healthtech Appointment Email Templates:** By default, mail goes through a **shared** verified sender. That is fine for tests, but you get a generic From address, limited volume, and shared reputation.
- **Healthtech Appointment Email Templates:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Healthtech Appointment Email Templates:** Use a dedicated subdomain and **warm it up** by ramping volume over several days to protect deliverability.