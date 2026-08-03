"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Phone, CheckCircle2 } from "lucide-react";
import PhoneOtpForm from "@/components/PhoneOtpForm";
import AvatarUploader from "@/components/AvatarUploader";

type Stage = "phone" | "otp" | "profile" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    birthdate: "",
    accountType: "personal",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 8) {
      setPhoneError("رقم جوال غير صالح");
      return;
    }
    setSendingOtp(true);
    setPhoneError("");
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setSendingOtp(false);
    setStage("otp");
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, phone, photo }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setProfileError(data.message ?? "تعذّر إنشاء الحساب");
      return;
    }
    setStage("done");
  };

  if (stage === "otp") {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <PhoneOtpForm phone={phone} onVerified={() => setStage("profile")} />
      </div>
    );
  }

  if (stage === "profile") {
    return (
      <div className="max-w-sm mx-auto px-4 py-14">
        <h1 className="text-2xl font-display font-bold text-navy mb-1 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-teal" />
          أكمل بيانات حسابك
        </h1>
        <p className="text-sm text-muted mb-6">رقم جوالك ({phone}) تم تأكيده ✅</p>

        <form onSubmit={submitProfile} className="flex flex-col gap-4">
          {profileError && <p className="text-sm text-red-600">{profileError}</p>}

          <AvatarUploader value={photo} onChange={setPhoto} />

          <label className="text-sm font-medium text-ink">
            الاسم الكامل
            <input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
          </label>
          <label className="text-sm font-medium text-ink">
            كلمة المرور
            <input required type="password" minLength={6} value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
          </label>
          <label className="text-sm font-medium text-ink">
            البريد الإلكتروني <span className="text-muted font-normal">(اختياري — لتأكيد إضافي واستلام الإشعارات)</span>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
          </label>
          <label className="text-sm font-medium text-ink">
            الجنس
            <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white">
              <option value="">حدد الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </label>
          <label className="text-sm font-medium text-ink">
            تاريخ الميلاد
            <input type="date" value={profile.birthdate} onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
          </label>

          <div className="text-sm font-medium text-ink flex flex-col gap-2">
            نوع الحساب
            <label className="flex items-start gap-2 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-teal has-[:checked]:bg-sand">
              <input type="radio" name="accountType" checked={profile.accountType === "personal"}
                onChange={() => setProfile({ ...profile, accountType: "personal" })} className="mt-1" />
              <span>
                <span className="font-bold block">استعمال شخصي</span>
                <span className="text-xs text-muted">للاستخدام غير التجاري — مناسب للأفراد الراغبين في بيع أو تأجير بعض ممتلكاتهم.</span>
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-teal has-[:checked]:bg-sand">
              <input type="radio" name="accountType" checked={profile.accountType === "business"}
                onChange={() => setProfile({ ...profile, accountType: "business" })} className="mt-1" />
              <span>
                <span className="font-bold block">استعمال تجاري</span>
                <span className="text-xs text-muted">للشركات أو من يعرضون عدداً أكبر من الإعلانات بشكل مستمر.</span>
              </span>
            </label>
          </div>

          <button
            disabled={saving}
            type="submit"
            className="mt-2 w-full rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors disabled:opacity-50"
          >
            {saving ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="w-14 h-14 text-teal" />
        <h1 className="text-xl font-display font-bold text-navy">تم إنشاء حسابك ✅</h1>
        <p className="text-sm text-muted">
          {profile.email
            ? "أرسلنا أيضاً رابط تأكيد لبريدك الإلكتروني — تقدر تكمله لاحقاً من صفحة حسابي."
            : "يمكنك الآن تسجيل الدخول برقم جوالك."}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors"
        >
          الذهاب لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-display font-bold text-navy mb-1 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-teal" />
        إنشاء حساب
      </h1>
      <p className="text-sm text-muted mb-6">نبدأ برقم جوالك — رح نرسل رمز تأكيد عبر واتساب.</p>

      <form onSubmit={sendOtp} className="flex flex-col gap-3">
        {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
        <label className="text-sm font-medium text-ink">
          رقم الجوال (واتساب)
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-2 focus-within:ring-2 focus-within:ring-teal">
            <Phone className="w-4 h-4 text-muted shrink-0" />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9xxxxxxx"
              className="flex-1 min-w-0 text-sm focus:outline-none"
            />
          </div>
        </label>
        <button
          disabled={sendingOtp}
          type="submit"
          className="mt-2 w-full rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors disabled:opacity-50"
        >
          {sendingOtp ? "جارٍ الإرسال..." : "إرسال رمز التأكيد"}
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        لديك حساب؟{" "}
        <Link href="/login" className="text-teal font-bold">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
