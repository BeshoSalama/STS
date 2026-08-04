import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendLeadNotification(subject: string, html: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured; skipping lead notification email.");
    return { skipped: true };
  }

  try {
    await resend.emails.send({
      from: "STS Agency <noreply@stsagency.com>",
      to: process.env.LEADS_NOTIFICATION_EMAIL ?? "sales@stsagency.com",
      subject,
      html,
    });
    return { skipped: false };
  } catch (error) {
    console.error("Failed to send lead notification email", error);
    return { skipped: true };
  }
}
