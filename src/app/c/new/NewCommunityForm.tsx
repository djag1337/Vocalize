"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCommunityForm() {
 const router = useRouter();
 const [slug, setSlug] = useState("");
 const [name, setName] = useState("");
 const [description, setDescription] = useState("");
 const [themeColor, setThemeColor] = useState("#ec4899");
 const [err, setErr] = useState("");
 const [busy, setBusy] = useState(false);

 async function submit(e: React.FormEvent) {
 e.preventDefault();
 setErr("");
 if (!slug.trim() || !name.trim()) {
 setErr("slug and name are required");
 return;
 }
 setBusy(true);
 try {
 const res = await fetch("/api/communities", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ slug, name, description, themeColor }),
 });
 if (!res.ok) {
 const d = await res.json().catch(() => ({}));
 throw new Error(d.error || "failed");
 }
 const c = await res.json();
 router.push(`/c/${c.slug}`);
 } catch (e: any) {
 setErr(e.message || "something broke");
 setBusy(false);
 }
 }

 return (
 <form onSubmit={submit} className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
 <div>
 <label className="block text-sm text-gray-300 mb-1">slug (URL: c/your-slug)</label>
 <input
 value={slug}
 onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
 placeholder="cool-stuff"
 maxLength={32}
 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-400 outline-none"
 />
 </div>
 <div>
 <label className="block text-sm text-gray-300 mb-1">name</label>
 <input
 value={name}
 onChange={e => setName(e.target.value)}
 placeholder="Cool Stuff"
 maxLength={48}
 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-400 outline-none"
 />
 </div>
 <div>
 <label className="block text-sm text-gray-300 mb-1">description (optional)</label>
 <textarea
 value={description}
 onChange={e => setDescription(e.target.value)}
 placeholder="what's this community about?"
 maxLength={300}
 rows={3}
 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-400 outline-none resize-none"
 />
 </div>
 <div>
 <label className="block text-sm text-gray-300 mb-1">theme color </label>
 <div className="flex items-center gap-3">
 <input
 type="color"
 value={themeColor}
 onChange={e => setThemeColor(e.target.value)}
 className="w-12 h-10 rounded-lg bg-transparent cursor-pointer"
 />
 <span className="text-sm text-gray-400">{themeColor}</span>
 </div>
 </div>

 {err && <p className="text-red-400 text-sm">{err}</p>}

 <button
 type="submit"
 disabled={busy}
 className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 font-semibold"
 >
 {busy ? "creating..." : "create community"}
 </button>
 </form>
 );
}
