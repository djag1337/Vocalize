"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; accentColor: string | null };
};

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      setText("");
      router.refresh();
    } catch {
      alert("couldn't post comment");
    } finally {
      setBusy(false);
    }
  }

  function timeAgo(d: string) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return new Date(d).toLocaleDateString();
  }

  return (
    <section className="flex flex-col" style={{ gap: "16px" }}>

      {/* ── Section label ── */}
      <p
        className="font-semibold uppercase tracking-widest"
        style={{ marginBottom: 0, fontSize: 12, color: "var(--muted)" }}
      >
        Replies
      </p>

      {/* ── Comment list / empty state ── */}
      {comments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            padding: "40px 24px",
            background: "var(--surface-3)",
            borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ fontSize: 28, marginBottom: "10px" }}>💬</span>
          <p className="font-semibold" style={{ fontSize: 15, color: "var(--foreground)" }}>Be the first to reply</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: "4px" }}>
            Share your thoughts on this post.
          </p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          {comments.map(c => {
            const initial = c.author.username[0]?.toUpperCase();
            return (
              <div
                key={c.id}
                className="flex"
                style={{
                  padding: "16px 18px",
                  gap: "12px",
                  background: "var(--surface-3)",
                  borderRadius: 24,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center font-bold shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    color: "white",
                    fontSize: 12,
                    marginTop: "1px",
                    background: c.author.accentColor
                      ? `linear-gradient(135deg, ${c.author.accentColor}88, ${c.author.accentColor})`
                      : "linear-gradient(135deg, var(--accent-2), var(--accent))",
                  }}
                >
                  {initial}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    <span className="font-semibold" style={{ fontSize: 13, color: "var(--foreground)" }}>
                      @{c.author.username}
                    </span>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>·</span>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <div
                    className="leading-relaxed"
                    style={{ marginTop: "4px", fontSize: 15, color: "var(--foreground)" }}
                  >
                    <MarkdownRenderer content={c.content} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reply input ── */}
      <form
        onSubmit={submit}
        className="flex flex-col"
        style={{
          padding: "14px 14px 14px 18px",
          gap: "10px",
          background: "var(--surface-3)",
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Preview or editor */}
        {previewing ? (
          <div
            className="flex-1 leading-relaxed"
            style={{ minHeight: "44px", paddingTop: "2px", fontSize: 15, color: "var(--foreground)" }}
          >
            {text.trim() ? (
              <MarkdownRenderer content={text} />
            ) : (
              <span style={{ color: "var(--muted)" }}>Nothing to preview</span>
            )}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Write a reply…"
            rows={2}
            className="flex-1 resize-none leading-relaxed"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "var(--foreground)",
              minHeight: "44px",
              maxHeight: "160px",
              caretColor: "var(--foreground)",
            }}
          />
        )}

        {/* Bottom row: preview toggle + send */}
        <div className="flex items-center justify-between" style={{ marginTop: "2px" }}>
          <button
            type="button"
            onClick={() => setPreviewing(p => !p)}
            className="font-medium transition-colors"
            style={{
              fontSize: 12,
              color: previewing ? "var(--foreground)" : "var(--muted)",
              background: previewing ? "var(--surface-2)" : "transparent",
              borderRadius: "8px",
              padding: "3px 10px",
              border: "1px solid var(--border)",
            }}
          >
            {previewing ? "Edit" : "Preview"}
          </button>
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="shrink-0 flex items-center justify-center transition-opacity disabled:opacity-25"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: "var(--foreground)",
            }}
            title="Send reply (⌘↵)"
          >
            <Send size={15} style={{ color: "var(--background)", marginLeft: "1px" }} />
          </button>
        </div>
      </form>
    </section>
  );
}
