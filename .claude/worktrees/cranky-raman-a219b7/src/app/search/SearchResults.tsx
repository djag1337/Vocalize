import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SearchResults({ query }: { query: string }) {
  const ilike = { contains: query, mode: "insensitive" as const };

  const [posts, communities, users] = await Promise.all([
    prisma.post.findMany({
      where: { OR: [{ title: ilike }, { content: ilike }], removed: false },
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
      <div className="p-8 text-center">
        <p className="text-[var(--muted)] text-[14px]">No results for &quot;{query}&quot;</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {communities.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
            Communities
          </h2>
          <div>
            {communities.map(c => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="block border-b border-[var(--border)] py-3 hover:bg-[var(--surface)]/30 transition-colors"
              >
                <div className="font-semibold text-[15px]" style={{ color: c.themeColor || "var(--accent)" }}>
                  c/{c.slug}
                </div>
                <div className="text-[13px] text-[var(--muted)]">{c.name}</div>
                {c.description && (
                  <p className="text-[12px] text-[var(--muted-2)] mt-0.5 clamp-2">{c.description}</p>
                )}
                <div className="text-[12px] text-[var(--muted-2)] mt-1">
                  {c._count.members} members · {c._count.posts} posts
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {users.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
            Users
          </h2>
          <div>
            {users.map(u => (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="block border-b border-[var(--border)] py-3 hover:bg-[var(--surface)]/30 transition-colors"
              >
                <div className="font-semibold text-[14px]" style={{ color: u.accentColor || "var(--accent-2)" }}>
                  @{u.username}
                </div>
                {u.displayName && (
                  <div className="text-[13px] text-[var(--muted)]">{u.displayName}</div>
                )}
                {u.bio && (
                  <p className="text-[12px] text-[var(--muted-2)] mt-0.5 clamp-2">{u.bio}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
            Posts
          </h2>
          <div>
            {posts.map(p => (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className="block border-b border-[var(--border)] py-3 hover:bg-[var(--surface)]/30 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] mb-1">
                  {p.community && (
                    <span className="font-semibold" style={{ color: p.community.themeColor || "var(--accent)" }}>
                      c/{p.community.slug}
                    </span>
                  )}
                  <span>·</span>
                  <span style={{ color: p.author.accentColor || "var(--accent-2)" }}>
                    @{p.author.username}
                  </span>
                </div>
                <h3 className="font-semibold text-[15px] text-[var(--foreground)]">{p.title}</h3>
                <p className="text-[13px] text-[var(--muted)] clamp-2 mt-0.5">{p.content}</p>
                <div className="text-[12px] text-[var(--muted-2)] mt-1">
                  {p._count.votes} votes · {p._count.comments} comments
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
