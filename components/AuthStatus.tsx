"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

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

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="hidden sm:flex items-center gap-1.5 text-sm text-white">
        <User className="w-4 h-4" />
        {session.user?.name}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-1 text-sm text-sand/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal rounded-full px-2 py-1"
      >
        <LogOut className="w-4 h-4" />
        خروج
      </button>
    </div>
  );
}
