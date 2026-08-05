"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Send, ArrowRight } from "lucide-react";

interface Msg {
  id: string;
  body: string;
  mine: boolean;
  createdAt: string;
}

export default function ChatThread({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [otherUserName, setOtherUserName] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [listingId, setListingId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/chat/${conversationId}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) {
      setMessages(data.messages);
      setOtherUserName(data.otherUserName);
      setListingTitle(data.listingTitle);
      setListingId(data.listingId);
      setLoaded(true);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const body = input.trim();
    setInput("");
    const res = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  if (!loaded) {
    return <div className="flex-1 flex items-center justify-center text-sm text-muted">جارٍ التحميل...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3 bg-white">
        <Link href="/inbox" className="text-muted hover:text-teal transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <p className="font-bold text-navy text-sm truncate">{otherUserName}</p>
          {listingId ? (
            <Link href={`/listing/${listingId}`} className="text-xs text-teal hover:underline truncate block">
              {listingTitle}
            </Link>
          ) : (
            <span className="text-xs text-muted">{listingTitle}</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-sand/40">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted mt-8">ابدأ المحادثة بإرسال أول رسالة.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.mine ? "self-start bg-teal text-white" : "self-end bg-white text-ink border border-line"}`}>
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        />
        <button
          disabled={sending || !input.trim()}
          type="submit"
          aria-label="إرسال"
          className="shrink-0 bg-teal text-white rounded-full p-2.5 hover:bg-teal-deep transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
