import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import VoteButtons from "@/components/VoteButtons";
import JoinButton from "./JoinButton";

export const dynamic = "force-dynamic";

export default async function CommunityPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string }> }) {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const { slug } = await params;
 const { sort } = await searchParams;
 const sortMode = sort === "top" ? "top" : "new";

 const community = await prisma.community.findUnique({
 where: { slug },
 include: {
 owner: { select: { id: true, username: true, displayName: true } },
 _count: { select: { posts: true, members: true } },
 },
 });
 if (!community) notFound();

 const userId = session.user.id!;
 const membership = await prisma.communityMember.findUnique({
 where: { userId_communityId: { userId, communityId: community.id } },
 });

 const posts = await prisma.post.findMany({
 where: { communityId: community.id },
 orderBy: sortMode === "top" ? { votes: { _count: "desc" } } : { createdAt: "desc" },
 take: 50,
 include: {
 author: { select: { username: true, displayName: true, accentColor: true } },
 _count: { select: { comments: true } },
 votes: { select: { value: true, userId: true } },
 },
 });

 const shaped = posts.map(p => ({
 ...p,
 score: p.votes.reduce((s, v) => s + v.value, 0),
 myVote: p.votes.find(v => v.userId === userId)?.value ?? 0,
 }));

 const accent = community.themeColor || "#ec4899";

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <div className="flex items-center gap-3 text-sm">
 <Link href="/c" className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs">All communities</Link>
 <Link href={`/submit?c=${community.slug}`} className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-xs font-medium">+ Post</Link>
 </div>
 </div>
 </header>

 <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
 <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6" style={{ borderTopColor: accent, borderTopWidth: 4 }}>
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl font-bold" style={{ color: accent }}>c/{community.slug}</h1>
 <p className="text-gray-300 text-sm mt-1">{community.name}</p>
 {community.description && <p className="text-gray-400 text-sm mt-2">{community.description}</p>}
 <p className="text-xs text-gray-500 mt-3">
 {community._count.members} members · {community._count.posts} posts · owned by @{community.owner.username}
 </p>
 </div>
 <JoinButton slug={community.slug} initiallyJoined={!!membership} accent={accent} />
 </div>
 </div>

 <div className="flex gap-2 text-sm">
 <Link href={`/c/${community.slug}?sort=new`} className={`px-3 py-1 rounded-full border ${sortMode === "new" ? "bg-white/10 border-white/30" : "border-white/10 hover:bg-white/5"}`}>New</Link>
 <Link href={`/c/${community.slug}?sort=top`} className={`px-3 py-1 rounded-full border ${sortMode === "top" ? "bg-white/10 border-white/30" : "border-white/10 hover:bg-white/5"}`}>Top</Link>
 </div>

 {shaped.length === 0 ? (
 <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
 <p className="text-gray-300">no posts here yet </p>
 <Link href={`/submit?c=${community.slug}`} className="inline-block mt-3 text-pink-400 hover:underline">be the first →</Link>
 </div>
 ) : (
 <div className="space-y-3">
 {shaped.map(p => (
 <div key={p.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 flex gap-3">
 <VoteButtons postId={p.id} initialScore={p.score} initialVote={p.myVote} />
 <Link href={`/p/${p.id}`} className="flex-1 min-w-0">
 <h2 className="font-semibold truncate">{p.title}</h2>
 <p className="text-sm text-gray-300 line-clamp-2 mt-1">{p.content}</p>
 <p className="text-xs text-gray-500 mt-2">@{p.author.username} · {p._count.comments}</p>
 </Link>
 </div>
 ))}
 </div>
 )}
 </div>
 </main>
 );
}
