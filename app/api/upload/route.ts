import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { MAX_LISTING_IMAGES } from "@/lib/constants";

// Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production on Vercel — persistent,
// hosted storage). Falls back to writing into /public/uploads on disk otherwise, which works
// fine for local development but does NOT persist on Vercel's serverless filesystem.

const MAX_FILES = MAX_LISTING_IMAGES;
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

  const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!useBlob) await mkdir(uploadDir, { recursive: true });

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

    if (useBlob) {
      const blob = await put(`listings/${filename}`, file, { access: "public" });
      urls.push(blob.url);
    } else {
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), bytes);
      urls.push(`/uploads/${filename}`);
    }
  }

  return NextResponse.json({ success: true, urls });
}
