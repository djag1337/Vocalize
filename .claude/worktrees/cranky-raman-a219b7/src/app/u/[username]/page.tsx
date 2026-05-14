import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      themeColor: true,
      accentColor: true,
      nowPlaying: true,
      createdAt: true,
      displayBadge: {
        select: { id: true, name: true, icon: true, color: true, rarity: true },
      },
      _count: { select: { posts: true, comments: true } },
      badges: { include: { badge: true } },
      posts: {
        where: { removed: false },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          community: { select: { slug: true, themeColor: true } },
          _count: { select: { comments: true, votes: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const isMe = session?.user?.id === user.id;
  const initial = (user.displayName || user.username)[0]?.toUpperCase();

  const rarityLabel: Record<string, string> = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    epic: "Epic",
    legendary: "Legendary",
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sticky back-nav */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ←
            </Link>
            <span className="font-semibold text-[15px]">{user.displayName || user.username}</span>
          </div>
          {isMe && (
            <Link href="/settings" className="btn-ghost text-xs py-1.5 px-4">
              Edit profile
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Banner */}
        <div className="relative h-40">
          {user.bannerUrl ? (
            <img src={user.bannerUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${user.themeColor || "var(--accent-2)"}, ${user.accentColor || "var(--accent)"})` }}
            />
          )}
          {/* Avatar overlapping banner */}
          <div
            className="absolute bottom-0 left-6 translate-y-1/2 w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold overflow-hidden shrink-0"
            style={{ borderColor: "var(--background)", background: user.themeColor || "var(--surface-2)" }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </div>

        {/* Name area */}
        <div className="pt-16 px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: user.accentColor || "var(--foreground)" }}>
                  {user.displayName || user.username}
                </h1>
                {user.displayBadge && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
                    style={{
                      background: `${user.displayBadge.color}33`,
                      borderColor: `${user.displayBadge.color}66`,
                      color: user.displayBadge.color,
                    }}
                  >
                    <span>{user.displayBadge.icon}</span>
                    <span>{user.displayBadge.name}</span>
                  </span>
                )}
              </div>
              <p className="text-[var(--muted)] text-[13px]">
                @{user.username} · joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.bio && (
            <div className="surface p-4 mt-4">
              <p className="text-[var(--muted)] text-[15px] whitespace-pre-wrap leading-relaxed">{user.bio}</p>
            </div>
          )}

          {user.nowPlaying && (
            <div className="surface p-4 mt-4 flex items-center gap-3">
              {/* Animated equalizer bars */}
              <div className="flex items-end gap-[3px] h-5 shrink-0">
                {[3, 5, 4, 6, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full eq-bar"
                    style={{
                      height: `${h * 3}px`,
                      background: user.accentColor || "var(--accent)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              {user.nowPlaying.startsWith("https://open.spotify.com") ? (
                <div className="flex-1">
                  <iframe
                    src={user.nowPlaying.replace("open.spotify.com/track", "open.spotify.com/embed/track")}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div className="text-[12px] text-[var(--muted)] mb-0.5">Now Playing</div>
                  <div className="text-[14px] font-medium">{user.nowPlaying}</div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 mb-6">
            {[
              { value: user._count.posts, label: "posts" },
              { value: user._count.comments, label: "comments" },
              { value: user.badges.length, label: "badges" },
            ].map(({ value, label }) => (
              <div key={label} className="surface p-3 text-center">
                <div className="text-xl font-bold" style={{ color: user.accentColor || "var(--foreground)" }}>
                  {value}
                </div>
                <div className="text-[12px] text-[var(--muted)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          {user.badges.length > 0 && (
            <div className="surface p-4 mb-6">
              <h2 className="text-[12px] font-semibold mb-3 text-[var(--muted)] uppercase tracking-wide">Badges</h2>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background: `${b.badge.color}33`,
                      borderColor: `${b.badge.color}66`,
                      color: b.badge.color,
                    }}
                  >
                    <span>{b.badge.icon}</span>
                    <span>{b.badge.name}</span>
                    <span className="opacity-60 text-[10px] font-normal ml-0.5" style={{ color: b.badge.color }}>
                      {rarityLabel[b.badge.rarity] ?? b.badge.rarity}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          <h2 className="text-[12px] font-semibold mb-3 text-[var(--muted)] uppercase tracking-wide">Posts</h2>
          {user.posts.length === 0 ? (
            <div className="surface p-6 text-center text-[var(--muted)] text-[14px] mb-6">
              no posts yet
            </div>
          ) : (
            <div className="mb-8">
              {user.posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="block border-b border-[var(--border)] py-4 hover:bg-[var(--surface)]/30 transition-colors -mx-1 px-1"
                >
                  <div className="flex items-center gap-2 text-[12px] text-[var(--muted)] mb-1">
                    {p.community && (
                      <span
                        className="font-medium"
                        style={{ color: p.community.themeColor || "var(--accent)" }}
                      >
                        c/{p.community.slug}
                      </span>
                    )}
                    <span>· {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-[15px] text-[var(--foreground)]">{p.title}</h3>
                  {p.content && (
                    <p className="text-[13px] text-[var(--muted)] clamp-2 mt-1">{p.content}</p>
                  )}
                  <div className="text-[12px] text-[var(--muted-2)] mt-2">
                    {p._count.votes} votes · {p._count.comments} comments
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
