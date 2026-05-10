import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import VoteButtons from "@/components/VoteButtons";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");

 const saves = await prisma.savedPost.findMany({
 where: { userId: session.user.id },
 orderBy: { savedAt: "desc" },
 include: {
 post: {
 include: {
 author: { select: { username: true, displayName: true, accentColor: true } },
 community: { select: { slug: true, name: true, themeColor: true } },
 _count: { select: { comments: true } },
 votes: { select: { value: true, userId: true } },
 },
 },
 },
 });

 const userId = session.user.id;
 const items = saves.map(s => ({
 savedAt: s.savedAt,
 post: {
 ...s.post,
 score: s.post.votes.reduce((sum, v) => sum + v.value, 0),
 myVote: s.post.votes.find(v => v.userId === userId)?.value ?? 0,
 },
 }));

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <div className="flex items-center gap-3 text-sm">
 <Link href="/feed" className="text-gray-300 hover:text-white">← Feed</Link>
 </div>
 </div>
 </header>

 <div className="max-w-2xl mx-auto px-6 py-6">
 <div className="flex items-center gap-3 mb-2"><Bookmark size={28} strokeWidth={2} className="text-pink-400" /><h1 className="text-2xl font-bold mb-1">Saved</h1></div>
 <p className="text-gray-400 text-sm mb-6">Posts you bookmarked</p>

 {items.length === 0 ? (
 <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
 <p className="text-gray-300">no saved posts yet </p>
 <p className="text-gray-500 text-sm mt-2">tap the bookmark on any post to save it</p>
 <Link href="/feed" className="inline-block mt-3 text-pink-400 hover:underline">browse the feed →</Link>
 </div>
 ) : (
 <ul className="space-y-3">
 {items.map(({ post, savedAt }) => (
 <li key={post.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 hover:border-white/20 transition">
 <div className="flex gap-3">
 <VoteButtons postId={post.id} initialScore={post.score} initialVote={post.myVote} />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
 {post.community && (
 <Link href={`/c/${post.community.slug}`} className="font-semibold hover:underline" style={{ color: post.community.themeColor }}>
 c/{post.community.slug}
 </Link>
 )}
 <span>•</span>
 <Link href={`/u/${post.author.username}`} className="hover:underline" style={{ color: post.author.accentColor }}>
 @{post.author.username}
 </Link>
 <span>•</span>
 <span title={new Date(savedAt).toLocaleString()}>saved {timeAgo(savedAt)}</span>
 </div>
 <Link href={`/p/${post.id}`} className="block">
 <h3 className="font-semibold text-lg mb-1 hover:text-pink-300">{post.title}</h3>
 <p className="text-gray-300 text-sm line-clamp-2">{post.content}</p>
 </Link>
 <div className="flex gap-4 mt-2 text-xs text-gray-400">
 <span className="inline-flex items-center gap-1">{post._count.comments} comments</span>
 </div>
 </div>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </main>
 );
}

function timeAgo(d: Date) {
 const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
 if (s < 60) return `${s}s ago`;
 if (s < 3600) return `${Math.floor(s / 60)}m ago`;
 if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
 return `${Math.floor(s / 86400)}d ago`;
}
