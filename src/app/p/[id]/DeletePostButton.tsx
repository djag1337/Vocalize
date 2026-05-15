"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/feed");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center" style={{ gap: 8 }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>Delete this post?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: "var(--red)",
            border: "none",
            borderRadius: 8,
            padding: "4px 12px",
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            fontSize: 13,
            color: "var(--muted)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete post"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        color: "var(--muted)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "color 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--red)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
    >
      <Trash2 size={16} strokeWidth={1.5} />
    </button>
  );
}
