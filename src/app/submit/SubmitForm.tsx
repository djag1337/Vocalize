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
 } catch (e: any) {
 setErr(e.message || "something broke");
 setBusy(false);
 }
 }

 return (
 <form onSubmit={submit} className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
 {communities.length > 0 && (
 <div>
 <label className="block text-sm text-gray-300 mb-1">community (optional)</label>
 <select
 value={communitySlug}
 onChange={e => setCommunitySlug(e.target.value)}
 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-400 outline-none"
 >
 <option value="">— none —</option>
 {communities.map(c => (
 <option key={c.slug} value={c.slug}>c/{c.slug} · {c.name}</option>
 ))}
 </select>
 </div>
 )}
 <div>
 <label className="block text-sm text-gray-300 mb-1">title</label>
 <input
 value={title}
 onChange={e => setTitle(e.target.value)}
 maxLength={200}
 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-400 outline-none"
 placeholder="say something..."
 />
 </div>
 <div>
 <label className="block text-sm text-gray-300 mb-1">content</label>
 <textarea
 value={content}
 onChange={e => setContent(e.target.value)}
 rows={8}
 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-400 outline-none resize-y"
 placeholder="what's on your mind?"
 />
 </div>
 {err && <p className="text-pink-400 text-sm">{err}</p>}
 <button
 type="submit"
 disabled={busy}
 className="w-full py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 font-medium disabled:opacity-50"
 >
 {busy ? "posting..." : "post "}
 </button>
 </form>
 );
}
