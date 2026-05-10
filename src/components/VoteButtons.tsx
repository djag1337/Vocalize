"use client";
import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

export default function VoteButtons({ postId, initialScore, initialVote }: { postId: string; initialScore: number; initialVote: number }) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(initialVote);
  const [busy, setBusy] = useState(false);

  async function cast(v: number) {
    if (busy) return;
    const newVote = vote === v ? 0 : v;
    const prevScore = score;
    const prevVote = vote;
    setVote(newVote);
    setScore(score - prevVote + newVote);
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newVote }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScore(data.score);
    } catch {
      setVote(prevVote);
      setScore(prevScore);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1 select-none">
      <button
        onClick={() => cast(1)}
        aria-label="upvote"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors ${
          vote === 1 ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        <ArrowBigUp size={20} strokeWidth={1.8} fill={vote === 1 ? "currentColor" : "none"} />
      </button>
      <span
        className={`text-[14px] font-semibold min-w-[20px] text-center ${
          vote === 1 ? "text-[var(--accent)]" : vote === -1 ? "text-purple-400" : "text-[var(--foreground)]"
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => cast(-1)}
        aria-label="downvote"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors ${
          vote === -1 ? "text-purple-400" : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        <ArrowBigDown size={20} strokeWidth={1.8} fill={vote === -1 ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
