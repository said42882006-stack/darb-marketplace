"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { MAX_LISTING_IMAGES } from "@/lib/constants";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setUploading(true);
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "تعذّر رفع الصور");
      } else {
        onChange([...images, ...data.urls].slice(0, MAX_LISTING_IMAGES));
      }
    } catch {
      setError("تعذّر الاتصال بالخادم أثناء رفع الصور");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">صور الإعلان (حتى {MAX_LISTING_IMAGES} صور)</span>
      <div className="flex flex-wrap gap-3">
        {images.map((url, idx) => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              aria-label="إزالة الصورة"
              className="absolute top-1 left-1 bg-navy-deep/70 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}

        {images.length < MAX_LISTING_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border border-dashed border-line flex flex-col items-center justify-center gap-1 text-muted hover:border-teal hover:text-teal transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            <span className="text-[10px]">إضافة</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
