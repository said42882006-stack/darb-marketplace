import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (client) return client;
  client = new Resend(process.env.RESEND_API_KEY);
  return client;
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
  const resend = getClient();
  if (!resend) {
    // No Resend key configured yet — log instead of failing, so the rest of the flow still works.
    console.log(`[mailer] RESEND_API_KEY not configured — would send "${subject}" to ${to}`);
    return { sent: false };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.MAIL_FROM || "OTR <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[mailer] Resend error:", error);
    return { sent: false, error };
  }

  return { sent: true, id: data?.id };
}
