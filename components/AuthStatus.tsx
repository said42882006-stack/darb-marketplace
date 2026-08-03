"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Home, Megaphone, Settings, Grid3x3, ChevronDown } from "lucide-react";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-16 h-8" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/login" className="text-sm font-medium text-sand/90 hover:text-white transition-colors">
          تسجيل الدخول
        </Link>
        <Link
          href="/register"
          className="text-sm font-bold text-white border border-white/30 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors"
        >
          إنشاء حساب
        </Link>
      </div>
    );
  }

  const phone = (session.user as any)?.phone as string | undefined;

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-white hover:text-sand transition-colors focus:outline-none focus:ring-2 focus:ring-teal rounded-full px-1"
      >
        <User className="w-5 h-5" />
        <span className="hidden sm:inline font-num">{phone ?? session.user?.name}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-line bg-white shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-line">
              <p className="font-num text-sm font-bold text-navy">{phone}</p>
              <p className="text-xs text-muted">{session.user?.name}</p>
            </div>
            <nav className="flex flex-col p-1">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-sand rounded-lg transition-colors">
                <Home className="w-4 h-4 text-teal" />
                الرئيسية
              </Link>
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-sand rounded-lg transition-colors">
                <Megaphone className="w-4 h-4 text-teal" />
                إعلاناتي
              </Link>
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-sand rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-teal" />
                إعدادات الحساب
              </Link>
              <Link href="/#categories" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-sand rounded-lg transition-colors">
                <Grid3x3 className="w-4 h-4 text-teal" />
                الأقسام
              </Link>
            </nav>
            <div className="border-t border-line p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                تسجيل خروج
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
