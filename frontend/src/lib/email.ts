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

export async function sendVerificationCodeEmail(email: string, code: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured; skipping verification email.");
    return { skipped: true };
  }

  try {
    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM ?? "STS Agency <noreply@stsagency.com>",
      to: email,
      subject: "Your STS Agency verification code",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f1235">
          <h2>Verify your STS Agency account</h2>
          <p>Use this code to confirm your email address:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    });
    return { skipped: false };
  } catch (error) {
    console.error("Failed to send verification email", error);
    return { skipped: true };
  }
}
