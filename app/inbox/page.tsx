"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface ConversationRow {
  id: string;
  listingTitle: string;
  listingId: string | null;
  otherUserName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationRow[] | null>(null);

  useEffect(() => {
    fetch("/api/chat/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setConversations(data.conversations);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-navy mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-teal" />
        دردشاتي
      </h1>

      {conversations === null && <p className="text-sm text-muted">جارٍ التحميل...</p>}

      {conversations && conversations.length === 0 && (
        <p className="text-sm text-muted">لا توجد محادثات بعد. ابدأ محادثة من صفحة أي إعلان.</p>
      )}

      <div className="flex flex-col gap-2">
        {conversations?.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 hover:border-teal transition-colors"
          >
            <div className="min-w-0">
              <p className="font-bold text-navy text-sm truncate">{c.otherUserName}</p>
              <p className="text-xs text-teal truncate">{c.listingTitle}</p>
              {c.lastMessage && <p className="text-xs text-muted truncate mt-0.5">{c.lastMessage}</p>}
            </div>
            {c.unreadCount > 0 && (
              <span className="shrink-0 bg-amber text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {c.unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
