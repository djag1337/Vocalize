"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkAllRead() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAll() {
    setLoading(true);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={markAll}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? "..." : "Mark all read"}
    </button>
  );
}
