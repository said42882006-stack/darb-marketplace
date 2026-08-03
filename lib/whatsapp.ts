import { toE164Oman } from "./phone";

function hasLiveTwilio() {
  return !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_WHATSAPP_FROM;
}

export async function sendWhatsAppOtp(phone: string, code: string): Promise<{ sent: boolean; mode: "live" | "mock" }> {
  const to = toE164Oman(phone);
  const body = `OTR: كود التحقق الخاص بك هو ${code}. صالح لمدة 10 دقائق.`;

  if (!hasLiveTwilio()) {
    console.log(`[whatsapp] Twilio not configured — would send OTP "${code}" to ${to}`);
    return { sent: false, mode: "mock" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: process.env.TWILIO_WHATSAPP_FROM!, // e.g. "whatsapp:+14155238886"
      To: `whatsapp:${to}`,
      Body: body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[whatsapp] Twilio send failed:", err);
    return { sent: false, mode: "live" };
  }

  return { sent: true, mode: "live" };
}
