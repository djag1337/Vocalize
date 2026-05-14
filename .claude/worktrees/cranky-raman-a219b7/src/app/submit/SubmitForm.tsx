"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitForm({ communities }: { communities: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !content.trim()) {
      setErr("title and content required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, communitySlug: communitySlug || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "failed");
      }
      const post = await res.json();
      router.push(`/p/${post.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "something broke");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {communities.length > 0 && (
        <div>
          <label className="block text-[12px] text-[var(--muted)] mb-1.5 font-medium uppercase tracking-wide">
            Community (optional)
          </label>
          <select
            value={communitySlug}
            onChange={e => setCommunitySlug(e.target.value)}
            className="input text-[15px]"
          >
            <option value="">— none —</option>
            {communities.map(c => (
              <option key={c.slug} value={c.slug}>
                c/{c.slug} · {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-[12px] text-[var(--muted)] mb-1.5 font-medium uppercase tracking-wide">
          Title
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
          className="input text-[15px]"
          placeholder="Say something..."
        />
      </div>
      <div>
        <label className="block text-[12px] text-[var(--muted)] mb-1.5 font-medium uppercase tracking-wide">
          Content
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
          className="input text-[15px] resize-y"
          placeholder="What's on your mind?"
        />
      </div>
      {err && <p className="text-[var(--red)] text-[13px]">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full"
      >
        {busy ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
