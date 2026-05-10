import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const { sort } = await searchParams;
 const sortMode = sort === "top" ? "top" : sort === "hot" ? "hot" : "new";

 const posts = await prisma.post.findMany({
 where: { removed: false },
 orderBy: sortMode === "top"
 ? { votes: { _count: "desc" } }
 : sortMode === "hot"
 ? { comments: { _count: "desc" } }
 : { createdAt: "desc" },
 take: 50,
 include: {
 author: { select: { id: true, username: true, displayName: true, accentColor: true, displayBadge: { select: { name: true, icon: true, color: true } } } },
 community: { select: { slug: true, name: true, themeColor: true } },
 flair: { select: { name: true, color: true } },
 _count: { select: { comments: true } },
 votes: { select: { value: true, userId: true } },
 saves: { where: { userId: session.user.id }, select: { id: true } },
 reactions: { select: { emoji: true, userId: true } },
 },
 });

 const userId = session.user.id;
 const shaped = posts.map(p => ({
 id: p.id,
 title: p.title,
 content: p.content,
 createdAt: p.createdAt,
 pinned: p.pinned,
 locked: p.locked,
 author: p.author,
 community: p.community,
 flair: p.flair,
 score: p.votes.reduce((s, v) => s + v.value, 0),
 myVote: p.votes.find(v => v.userId === userId)?.value ?? 0,
 commentCount: p._count.comments,
 saved: p.saves.length > 0,
 reactions: p.reactions,
 }));

 const tabs = [
 { mode: "new", label: "New" },
 { mode: "hot", label: "Hot" },
 { mode: "top", label: "Top" },
 ];

 return (
 <AppShell username={session.user.name || ""}>
 <header className="sticky top-0 z-10 bg-[var(--background)]/85 backdrop-blur border-b border-[var(--border)]">
 <div className="px-4 py-3 flex items-center justify-between">
 <h1 className="font-bold text-lg">Home</h1>
 <Link href="/submit" className="pill pill-primary text-xs">+ Post</Link>
 </div>
 <div className="flex">
 {tabs.map(t => (
 <Link
 key={t.mode}
 href={`/feed?sort=${t.mode}`}
 className={`flex-1 text-center py-3 text-sm border-b-2 transition ${
 sortMode === t.mode ? "border-pink-500 text-white font-semibold" : "border-transparent text-gray-400 hover:bg-[var(--surface)]"
 }`}
 >
 {t.label}
 </Link>
 ))}
 </div>
 </header>

 {shaped.length === 0 ? (
 <div className="p-10 text-center">
 <p className="text-gray-400 mb-2">no posts yet</p>
 <Link href="/submit" className="text-pink-400 hover:underline">be the first →</Link>
 </div>
 ) : (
 <div>
 {shaped.map(p => <PostCard key={p.id} post={p} myUserId={userId} />)}
 </div>
 )}
 </AppShell>
 );
}
