import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SearchResults({ query }: { query: string }) {
 const ilike = { contains: query, mode: "insensitive" as const };

 const [posts, communities, users] = await Promise.all([
 prisma.post.findMany({
 where: { OR: [{ title: ilike }, { content: ilike }] },
 take: 20,
 orderBy: { createdAt: "desc" },
 include: {
 author: { select: { username: true, accentColor: true } },
 community: { select: { slug: true, name: true, themeColor: true } },
 _count: { select: { comments: true, votes: true } },
 },
 }),
 prisma.community.findMany({
 where: { OR: [{ name: ilike }, { slug: ilike }, { description: ilike }] },
 take: 10,
 include: { _count: { select: { members: true, posts: true } } },
 }),
 prisma.user.findMany({
 where: { OR: [{ username: ilike }, { displayName: ilike }] },
 take: 10,
 select: { id: true, username: true, displayName: true, accentColor: true, bio: true },
 }),
 ]);

 const noResults = posts.length === 0 && communities.length === 0 && users.length === 0;
 if (noResults) {
 return (
 <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
 <p className="text-gray-300">no results for &quot;{query}&quot; </p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {communities.length > 0 && (
 <section>
 <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2"> Communities</h2>
 <ul className="space-y-2">
 {communities.map(c => (
 <li key={c.id}>
 <Link href={`/c/${c.slug}`} className="block bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-3">
 <div className="font-semibold" style={{ color: c.themeColor }}>c/{c.slug}</div>
 <div className="text-sm text-gray-300">{c.name}</div>
 {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>}
 <div className="text-xs text-gray-500 mt-1">{c._count.members} members · {c._count.posts} posts</div>
 </Link>
 </li>
 ))}
 </ul>
 </section>
 )}

 {users.length > 0 && (
 <section>
 <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2"> Users</h2>
 <ul className="space-y-2">
 {users.map(u => (
 <li key={u.id}>
 <Link href={`/u/${u.username}`} className="block bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-3">
 <div className="font-semibold" style={{ color: u.accentColor }}>@{u.username}</div>
 {u.displayName && <div className="text-sm text-gray-300">{u.displayName}</div>}
 {u.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{u.bio}</p>}
 </Link>
 </li>
 ))}
 </ul>
 </section>
 )}

 {posts.length > 0 && (
 <section>
 <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2"> Posts</h2>
 <ul className="space-y-2">
 {posts.map(p => (
 <li key={p.id}>
 <Link href={`/p/${p.id}`} className="block bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-3">
 <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
 {p.community && (
 <span className="font-semibold" style={{ color: p.community.themeColor }}>c/{p.community.slug}</span>
 )}
 <span>•</span>
 <span style={{ color: p.author.accentColor }}>@{p.author.username}</span>
 </div>
 <h3 className="font-semibold hover:text-pink-300">{p.title}</h3>
 <p className="text-sm text-gray-300 line-clamp-2 mt-1">{p.content}</p>
 <div className="text-xs text-gray-500 mt-2">▲ {p._count.votes} · {p._count.comments}</div>
 </Link>
 </li>
 ))}
 </ul>
 </section>
 )}
 </div>
 );
}
