"use client";

import { useState } from "react";
import { Camera, Loader2, User } from "lucide-react";

export default function AvatarUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.urls?.[0]) onChange(data.urls[0]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="relative w-20 h-20 rounded-full border-2 border-dashed border-line bg-sand flex items-center justify-center cursor-pointer overflow-hidden hover:border-teal transition-colors">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : uploading ? (
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        ) : (
          <User className="w-8 h-8 text-muted" />
        )}
        <span className="absolute bottom-0 inset-x-0 bg-navy/80 text-white flex items-center justify-center py-1">
          <Camera className="w-3.5 h-3.5" />
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>
      <span className="text-xs text-muted">صورة الحساب (اختياري)</span>
    </div>
  );
}
