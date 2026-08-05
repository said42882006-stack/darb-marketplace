"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle, Loader2 } from "lucide-react";

export default function ChatButton({ listingId }: { listingId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!session?.user) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push(`/chat/${data.conversationId}`);
    } else {
      alert(data.message ?? "تعذّر بدء المحادثة");
    }
  };

  return (
    <button
      onClick={start}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold border border-teal text-teal hover:bg-sand transition-colors focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
      دردشة
    </button>
  );
}
