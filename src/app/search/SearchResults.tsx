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
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.4 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p
          className="font-semibold"
          style={{ marginBottom: "6px", fontSize: 17, color: "var(--foreground)" }}
        >
          No results for &ldquo;{query}&rdquo;
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Try different keywords or check the spelling
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", paddingTop: "20px" }}>
      {communities.length > 0 && (
        <section>
          <h2
            className="font-semibold uppercase tracking-[0.08em]"
            style={{ marginBottom: "12px", fontSize: 11, color: "var(--muted)" }}
          >
            Spaces
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {communities.map(c => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="hover:opacity-90 transition-opacity"
                style={{
                  display: "block",
                  padding: "18px 20px",
                  textDecoration: "none",
                  background: "var(--surface-3)",
                  borderRadius: 24,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  className="font-bold"
                  style={{ fontSize: 17, color: c.themeColor || "var(--accent)" }}
                >
                  s/{c.slug}
                </div>
                <div style={{ fontSize: 15, color: "var(--muted)", marginTop: "2px" }}>
                  {c.name}
                </div>
                {c.description && (
                  <p
                    className="clamp-2"
                    style={{ marginTop: "6px", fontSize: 13, color: "var(--muted)" }}
                  >
                    {c.description}
                  </p>
                )}
                <div style={{ marginTop: "8px", fontSize: 13, color: "var(--muted)" }}>
                  {c._count.members} members · {c._count.posts} posts
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {users.length > 0 && (
        <section>
          <h2
            className="font-semibold uppercase tracking-[0.08em]"
            style={{ marginBottom: "12px", fontSize: 11, color: "var(--muted)" }}
          >
            Users
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {users.map(u => (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="hover:opacity-90 transition-opacity"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 20px",
                  gap: "12px",
                  textDecoration: "none",
                  background: "var(--surface-3)",
                  borderRadius: 24,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                {/* Avatar circle with initials */}
                <div
                  className="font-bold"
                  style={{
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: 9999,
                    background: u.accentColor
                      ? `linear-gradient(135deg, ${u.accentColor}88, ${u.accentColor})`
                      : "linear-gradient(135deg, var(--accent-2), var(--accent))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    color: "white",
                  }}
                >
                  {(u.displayName || u.username)[0]?.toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="font-semibold" style={{ fontSize: 17, color: "var(--foreground)" }}>
                    {u.displayName || u.username}
                  </div>
                  <div style={{ fontSize: 15, color: "var(--muted)", marginTop: "2px" }}>
                    @{u.username}
                  </div>
                  {u.bio && (
                    <p
                      className="clamp-2"
                      style={{ marginTop: "4px", fontSize: 13, color: "var(--muted)" }}
                    >
                      {u.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2
            className="font-semibold uppercase tracking-[0.08em]"
            style={{ marginBottom: "12px", fontSize: 11, color: "var(--muted)" }}
          >
            Posts
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {posts.map(p => (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className="hover:opacity-90 transition-opacity"
                style={{
                  display: "block",
                  padding: "18px 20px",
                  textDecoration: "none",
                  background: "var(--surface-3)",
                  borderRadius: 24,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                    fontSize: 13,
                  }}
                >
                  {p.community && (
                    <span
                      className="font-semibold"
                      style={{ color: p.community.themeColor || "var(--accent)" }}
                    >
                      s/{p.community.slug}
                    </span>
                  )}
                  {p.community && <span style={{ color: "var(--muted)" }}>·</span>}
                  <span style={{ color: p.author.accentColor || "var(--accent)" }}>
                    @{p.author.username}
                  </span>
                </div>
                <h3
                  className="font-semibold"
                  style={{ fontSize: 17, color: "var(--foreground)", lineHeight: "22px" }}
                >
                  {p.title}
                </h3>
                {p.content && (
                  <p
                    className="clamp-2"
                    style={{ marginTop: "4px", lineHeight: "22px", fontSize: 15, color: "var(--muted)" }}
                  >
                    {p.content}
                  </p>
                )}
                <div style={{ marginTop: "10px", fontSize: 13, color: "var(--muted)" }}>
                  {p._count.votes} likes · {p._count.comments} comments
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
