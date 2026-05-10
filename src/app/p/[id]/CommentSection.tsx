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

 return (
 <section className="mt-6">
 <h2 className="text-sm font-semibold text-gray-300 mb-3"> {comments.length} comment{comments.length === 1 ? "" : "s"}</h2>
 <form onSubmit={submit} className="mb-4 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur">
 <textarea
 value={text}
 onChange={e => setText(e.target.value)}
 rows={3}
 placeholder="add a comment..."
 className="w-full bg-transparent outline-none resize-none text-sm"
 />
 <div className="flex justify-end">
 <button disabled={busy || !text.trim()} className="px-4 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50">
 {busy ? "..." : "comment"}
 </button>
 </div>
 </form>
 <div className="space-y-2">
 {comments.map(c => (
 <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur">
 <div className="text-xs text-gray-400 mb-1">
 <span style={{ color: c.author.accentColor || "#a78bfa" }}>@{c.author.username}</span>
 <span> · {new Date(c.createdAt).toLocaleString()}</span>
 </div>
 <p className="text-gray-200 text-sm whitespace-pre-wrap">{c.content}</p>
 </div>
 ))}
 </div>
 </section>
 );
}
