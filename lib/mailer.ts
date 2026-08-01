import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
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
  const t = getTransporter();
  if (!t) {
    // No SMTP configured yet — log instead of failing, so the rest of the flow still works.
    console.log(`[mailer] SMTP not configured — would send "${subject}" to ${to}`);
    return { sent: false };
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || "OTR <no-reply@darb.app>",
    to,
    subject,
    html,
  });
  return { sent: true };
}
