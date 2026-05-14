"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function VoteButtons({ postId, initialScore, initialVote }: { postId: string; initialScore: number; initialVote: number }) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(initialVote);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (busy) return;
    const newVote = vote === 1 ? 0 : 1;
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

  const liked = vote === 1;

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1.5 py-1 transition-colors ${
        liked ? "text-[var(--red)]" : "text-[var(--muted)] hover:text-[var(--red)]"
      }`}
    >
      <Heart size={20} strokeWidth={1.6} fill={liked ? "currentColor" : "none"} />
      {score > 0 && <span className="text-[14px] font-medium">{score}</span>}
    </button>
  );
}
