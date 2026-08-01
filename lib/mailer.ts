import { Resend } from "resend";
import nodemailer from "nodemailer";

// Prefers Resend (better deliverability once a domain is verified there).
// Falls back to Gmail/any SMTP provider — free, works for any recipient, but
// more likely to land in spam on first contact until the sender is trusted.
// Falls back further to console logging if neither is configured.

let resendClient: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (resendClient) return resendClient;
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

let smtpTransport: ReturnType<typeof nodemailer.createTransport> | null = null;
function getSmtp() {
  if (!process.env.SMTP_HOST) return null;
  if (smtpTransport) return smtpTransport;
  smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return smtpTransport;
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.MAIL_FROM || "OTR <onboarding@resend.dev>";

  const resend = getResend();
  if (resend) {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (!error) return { sent: true, id: data?.id, via: "resend" };
    console.error("[mailer] Resend error, falling back to SMTP if configured:", error);
  }

  const smtp = getSmtp();
  if (smtp) {
    try {
      await smtp.sendMail({ from, to, subject, html });
      return { sent: true, via: "smtp" };
    } catch (err) {
      console.error("[mailer] SMTP error:", err);
      return { sent: false, error: err };
    }
  }

  console.log(`[mailer] No email provider configured — would send "${subject}" to ${to}`);
  return { sent: false };
}