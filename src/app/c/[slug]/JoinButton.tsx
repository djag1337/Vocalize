"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ slug, initiallyJoined, accent }: { slug: string; initiallyJoined: boolean; accent: string }) {
  const [joined, setJoined] = useState(initiallyJoined);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/communities/${slug}/join`, { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setJoined(d.joined);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="px-4 py-2 rounded-full text-sm font-medium shrink-0 transition disabled:opacity-50"
      style={joined
        ? { background: "transparent", border: `1px solid ${accent}`, color: accent }
        : { background: accent, color: "white" }}
    >
      {busy ? "..." : joined ? "✓ Joined" : "Join"}
    </button>
  );
}
