import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { name, contact, message } = await req.json();

  if (!name || !contact || !message) {
    return NextResponse.json({ success: false, message: "الرجاء تعبئة كل الحقول" }, { status: 400 });
  }

  const adminEmail = process.env.CONTACT_EMAIL || process.env.MAIL_FROM?.match(/<(.+)>/)?.[1];
  if (!adminEmail) {
    console.log(`[contact] CONTACT_EMAIL not configured — message from ${name} (${contact}): ${message}`);
    return NextResponse.json({ success: true, mode: "mock" });
  }

  try {
    await sendMail({
      to: adminEmail,
      subject: `رسالة تواصل جديدة من ${name} - OTR`,
      html: `
        <div dir="rtl" style="font-family:sans-serif;line-height:1.8">
          <h2>رسالة جديدة عبر صفحة التواصل</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>وسيلة التواصل:</strong> ${contact}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${String(message).replace(/\n/g, "<br>")}</p>
        </div>`,
    });
  } catch (err) {
    console.error("[contact] failed to send:", err);
    return NextResponse.json({ success: false, message: "تعذّر إرسال الرسالة" }, { status: 500 });
  }

  return NextResponse.json({ success: true, mode: "live" });
}
