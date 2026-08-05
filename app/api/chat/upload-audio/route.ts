import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB — voice notes are short, this is generous

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "لم يتم اختيار أي ملف صوتي" }, { status: 400 });
    }
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ success: false, message: "صيغة الملف غير مدعومة" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: "الرسالة الصوتية طويلة جداً" }, { status: 400 });
    }

    const ext = file.type.includes("webm") ? "webm" : file.type.includes("mp4") ? "m4a" : "ogg";
    const filename = `${randomUUID()}.${ext}`;
    const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (useBlob) {
      const blob = await put(`chat-audio/${filename}`, file, { access: "public" });
      return NextResponse.json({ success: true, url: blob.url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[chat upload-audio] failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message: `فشل الرفع: ${message}` }, { status: 500 });
  }
}
