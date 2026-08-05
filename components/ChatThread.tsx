"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Send, ArrowRight, ImagePlus, Mic, Square, Loader2 } from "lucide-react";

interface Msg {
  id: string;
  body: string;
  type: "text" | "image" | "audio";
  attachmentUrl: string | null;
  mine: boolean;
  createdAt: string;
}

export default function ChatThread({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState<Msg | null>(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [listingId, setListingId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    const interval = setInterval(fetchMessages, 2500); // faster refresh
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pending]);

  const postMessage = async (payload: { body?: string; type?: string; attachmentUrl?: string }) => {
    const res = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setMessages((prev) => [...prev, data.message]);
    }
    setPending(null);
    return data;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const body = input.trim();
    setInput("");
    setSending(true);
    // Optimistic bubble — shows instantly instead of waiting for the round trip.
    setPending({ id: "pending", body, type: "text", attachmentUrl: null, mine: true, createdAt: new Date().toISOString() });
    await postMessage({ body, type: "text" });
    setSending(false);
  };

  const sendImage = async (file: File) => {
    setUploadingImage(true);
    const previewUrl = URL.createObjectURL(file);
    setPending({ id: "pending", body: "", type: "image", attachmentUrl: previewUrl, mine: true, createdAt: new Date().toISOString() });
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.urls?.[0]) {
        await postMessage({ type: "image", attachmentUrl: data.urls[0] });
      } else {
        setPending(null);
        alert(data.message ?? "تعذّر رفع الصورة");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        setUploadingAudio(true);
        setPending({ id: "pending", body: "", type: "audio", attachmentUrl: URL.createObjectURL(blob), mine: true, createdAt: new Date().toISOString() });
        try {
          const formData = new FormData();
          formData.append("file", blob, "voice.webm");
          const res = await fetch("/api/chat/upload-audio", { method: "POST", body: formData });
          const data = await res.json();
          if (data.success && data.url) {
            await postMessage({ type: "audio", attachmentUrl: data.url });
          } else {
            setPending(null);
            alert(data.message ?? "تعذّر رفع الرسالة الصوتية");
          }
        } finally {
          setUploadingAudio(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert("تعذّر الوصول للميكروفون — تأكد من إعطاء الصلاحية للمتصفح");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  if (!loaded) {
    return <div className="flex-1 flex items-center justify-center text-sm text-muted">جارٍ التحميل...</div>;
  }

  const allMessages = pending ? [...messages, pending] : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3 bg-white shrink-0">
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

      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-sand/50"
        style={{ backgroundImage: "url('/chat-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "340px" }}
      >
        {allMessages.length === 0 && (
          <p className="text-center text-sm text-muted mt-8">ابدأ المحادثة بإرسال أول رسالة.</p>
        )}
        {allMessages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
              m.mine ? "self-start bg-teal text-white" : "self-end bg-white text-ink border border-line"
            } ${m.id === "pending" ? "opacity-70" : ""}`}
          >
            {m.type === "image" && m.attachmentUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.attachmentUrl} alt="" className="rounded-lg max-w-full max-h-64 object-cover" />
            )}
            {m.type === "audio" && m.attachmentUrl && (
              <audio controls src={m.attachmentUrl} className="max-w-[220px]" />
            )}
            {m.type === "text" && m.body}
            {m.body && m.type !== "text" && <p className="mt-1">{m.body}</p>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3 bg-white shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) sendImage(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage || recording}
          aria-label="إرسال صورة"
          className="shrink-0 text-muted hover:text-teal transition-colors disabled:opacity-40 p-1"
        >
          {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={uploadingAudio}
          aria-label={recording ? "إيقاف التسجيل" : "تسجيل رسالة صوتية"}
          className={`shrink-0 transition-colors disabled:opacity-40 p-1 ${recording ? "text-red-600" : "text-muted hover:text-teal"}`}
        >
          {uploadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : recording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={recording ? "جارٍ التسجيل..." : "اكتب رسالتك..."}
          disabled={recording}
          className="flex-1 rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-50"
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
