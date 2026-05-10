import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");

 const communities = await prisma.community.findMany({
 orderBy: { createdAt: "desc" },
 take: 100,
 include: { _count: { select: { posts: true, members: true } } },
 });

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <div className="flex items-center gap-3 text-sm">
 <Link href="/c/new" className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-xs font-medium">+ New community</Link>
 <Link href="/feed" className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs">Feed</Link>
 </div>
 </div>
 </header>

 <div className="max-w-2xl mx-auto px-6 py-6">
 <div className="flex items-center gap-3 mb-2"><Users size={28} strokeWidth={2} className="text-pink-400" /><h1 className="text-3xl font-bold mb-6">Communities</h1></div>

 {communities.length === 0 ? (
 <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
 <p className="text-gray-300">no communities yet </p>
 <Link href="/c/new" className="inline-block mt-3 text-pink-400 hover:underline">create the first one →</Link>
 </div>
 ) : (
 <div className="space-y-3">
 {communities.map(c => (
 <Link key={c.id} href={`/c/${c.slug}`} className="block bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="font-bold" style={{ color: c.themeColor || "#ec4899" }}>c/{c.slug}</span>
 <span className="text-gray-400 text-sm truncate">{c.name}</span>
 </div>
 {c.description && <p className="text-sm text-gray-300 mt-1 line-clamp-2">{c.description}</p>}
 </div>
 <div className="text-xs text-gray-400 text-right shrink-0">
 <div>{c._count.posts} posts</div>
 <div>{c._count.members} members</div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 )}
 </div>
 </main>
 );
}
