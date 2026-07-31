import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Local-dev implementation: files are written to /public/uploads and served statically.
// NOTE: Vercel's serverless filesystem is read-only (except /tmp) and ephemeral, so this
// approach does NOT persist in that kind of production deployment. For production, swap this
// handler to upload to Cloudinary / Vercel Blob / S3 and return the resulting hosted URL instead.
//
// Cloudinary example (once CLOUDINARY_URL is set):
// const cloudinary = require("cloudinary").v2;
// const result = await cloudinary.uploader.upload(dataUri);
// return NextResponse.json({ url: result.secure_url });

const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ success: false, message: "لم يتم اختيار أي صورة" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ success: false, message: `الحد الأقصى ${MAX_FILES} صور` }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ success: false, message: "صيغة الصورة غير مدعومة (JPG, PNG, WEBP فقط)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: "حجم الصورة يتجاوز 5 ميجابايت" }, { status: 400 });
    }
    const ext = file.type.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    urls.push(`/uploads/${filename}`);
  }

  return NextResponse.json({ success: true, urls });
}
