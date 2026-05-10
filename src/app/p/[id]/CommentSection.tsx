"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; accentColor: string | null };
};

export default function CommentSection({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

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
    <section>
      <h2 className="text-[13px] font-semibold text-[var(--muted)] mb-4 uppercase tracking-wide">
        {comments.length} comment{comments.length === 1 ? "" : "s"}
      </h2>

      {/* Comment input */}
      <form onSubmit={submit} className="mb-6">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          placeholder="Add a comment..."
          className="input resize-none text-[15px]"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="btn-primary text-[13px] px-5 py-2"
          >
            {busy ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-0">
        {comments.map(c => (
          <div key={c.id} className="border-b border-[var(--border)] py-4">
            <div className="flex items-center gap-1.5 text-[13px] mb-1.5">
              <span
                className="font-semibold"
                style={{ color: c.author.accentColor || "var(--accent-2)" }}
              >
                @{c.author.username}
              </span>
              <span className="text-[var(--muted-2)]">·</span>
              <span className="text-[var(--muted-2)]">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-[15px] text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
