import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import BadgeIcon from "@/components/BadgeIcon";

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
          votes: { select: { value: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const isMe = session?.user?.id === user.id;
  const initial = (user.displayName || user.username)[0]?.toUpperCase();
  const accent = user.accentColor || "var(--accent)";
  const theme = user.themeColor || user.accentColor || "var(--accent)";

  function timeAgo(d: Date) {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return d.toLocaleDateString();
  }

  return (
    <AppShell username={session?.user?.name || ""} title={user.displayName || user.username}>

      {/* ── Banner ── */}
      {user.bannerUrl ? (
        <div style={{ height: 130, overflow: "hidden" }}>
          <img src={user.bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ height: 130, background: `linear-gradient(135deg, ${theme}, ${accent})` }} />
      )}

      {/* ── Avatar + edit button row (overlaps banner) ── */}
      <div className="flex items-end justify-between" style={{ padding: "0 24px", marginTop: -44 }}>
        <div
          className="flex items-center justify-center font-bold overflow-hidden shrink-0"
          style={{
            width: 88, height: 88, fontSize: 30,
            borderRadius: 9999,
            border: "4px solid var(--background)",
            color: "white",
            background: user.avatarUrl
              ? undefined
              : `linear-gradient(135deg, ${theme}, ${accent})`,
          }}
        >
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="w-full" style={{ height: "100%", objectFit: "cover" }} />
            : initial}
        </div>

        {isMe && (
          <Link
            href="/settings"
            className="flex items-center justify-center font-semibold border hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            style={{
              height: 36,
              paddingLeft: 20,
              paddingRight: 20,
              fontSize: 14,
              borderRadius: 9999,
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Edit profile
          </Link>
        )}
      </div>

      {/* ── Name + info ── */}
      <div style={{ padding: "14px 24px 0 24px" }}>
        {/* Name + badge icons */}
        <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
          <h1 className="font-bold leading-tight" style={{ fontSize: 24, color: "var(--foreground)" }}>
            {user.displayName || user.username}
          </h1>
          {user.badges.length > 0 && (
            <div className="flex items-center" style={{ gap: 4, paddingBottom: 2 }}>
              {user.badges.map((b) => (
                <BadgeIcon
                  key={b.id}
                  icon={b.badge.icon}
                  name={b.badge.name}
                  color={b.badge.color}
                  rarity={b.badge.rarity}
                />
              ))}
            </div>
          )}
        </div>
        <span className="block" style={{ fontSize: 15, color: "var(--muted)", marginTop: 2 }}>@{user.username}</span>

        {/* Bio */}
        {user.bio && (
          <p className="leading-[22px] whitespace-pre-line" style={{ fontSize: 15, color: "var(--foreground)", marginTop: 12 }}>
            {user.bio}
          </p>
        )}

        {/* Stats pills */}
        <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 16 }}>
          {[
            { label: "posts", value: user._count.posts },
            { label: "comments", value: user._count.comments },
            { label: "badges", value: user.badges.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center"
              style={{ gap: 6, borderRadius: 9999, background: "var(--surface-3)", padding: "6px 14px" }}
            >
              <span className="font-bold" style={{ fontSize: 15, color: "var(--foreground)" }}>{value}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
            </div>
          ))}
          <div
            className="flex items-center"
            style={{ gap: 6, borderRadius: 9999, background: "var(--surface-3)", padding: "6px 14px" }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Joined {user.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Now Playing */}
        {user.nowPlaying && (
          <div
            className="flex items-center"
            style={{
              gap: 12,
              marginTop: 14,
              padding: 12,
              fontSize: 14,
              borderRadius: 16,
              background: "var(--surface-3)",
            }}
          >
            <div className="flex items-end shrink-0" style={{ gap: 2, height: 16 }}>
              {[3, 5, 4, 6, 3].map((h, i) => (
                <div
                  key={i}
                  className="eq-bar"
                  style={{
                    width: 2,
                    height: `${h * 2}px`,
                    borderRadius: 9999,
                    background: accent,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            {user.nowPlaying.startsWith("https://open.spotify.com") ? (
              <iframe
                src={user.nowPlaying.replace("open.spotify.com/track", "open.spotify.com/embed/track")}
                width="100%" height="80" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                style={{ borderRadius: 12, maxWidth: 384 }}
              />
            ) : (
              <span style={{ color: "var(--muted)" }}>{user.nowPlaying}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex"
        style={{ marginTop: 20, borderBottom: "1px solid var(--border)" }}
      >
        {["Threads", "Replies"].map((tab, i) => (
          <div
            key={tab}
            className="flex-1 flex items-center justify-center font-semibold"
            style={{
              height: 48,
              fontSize: 15,
              color: i === 0 ? accent : "var(--muted)",
              borderBottom: i === 0 ? `2px solid ${accent}` : "2px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ── Posts ── */}
      {user.posts.length === 0 ? (
        <div
          className="text-center"
          style={{ paddingTop: 64, paddingBottom: 64, color: "var(--muted)", fontSize: 15 }}
        >
          No posts yet
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 16, padding: "20px 16px 0 16px" }}>
          {user.posts.map((p) => {
            const postScore = (p as typeof p & { votes: { value: number }[] }).votes?.reduce((s: number, v: { value: number }) => s + v.value, 0) ?? p._count.votes;
            const typeIcon = (p as { postType?: string }).postType === "image" ? "🖼" : (p as { postType?: string }).postType === "music" ? "🎵" : null;
            return (
            <Link
              key={p.id}
              href={`/p/${p.id}`}
              className="flex flex-col hover:brightness-110 transition-all"
              style={{
                borderRadius: 24,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                background: "var(--surface-3)",
                padding: "20px 24px 20px 24px",
              }}
            >
              {/* Author row */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <div
                  className="flex items-center justify-center font-bold shrink-0"
                  style={{
                    width: 36, height: 36,
                    borderRadius: 9999,
                    color: "white",
                    fontSize: 13,
                    background: user.accentColor
                      ? `linear-gradient(135deg, ${user.accentColor}88, ${user.accentColor})`
                      : "linear-gradient(135deg, var(--accent-2), var(--accent))",
                  }}
                >
                  {initial}
                </div>
                <div className="flex items-center min-w-0" style={{ gap: 8 }}>
                  <span className="font-semibold truncate" style={{ fontSize: 15, color: "var(--foreground)" }}>
                    {user.displayName || user.username}
                  </span>
                  <span className="truncate" style={{ fontSize: 14, color: "var(--muted)" }}>@{user.username}</span>
                  <span className="shrink-0" style={{ color: "var(--muted)" }}>·</span>
                  <span className="shrink-0" style={{ fontSize: 13, color: "var(--muted)" }}>{timeAgo(p.createdAt)}</span>
                  {typeIcon && <span className="shrink-0" style={{ fontSize: 13 }}>{typeIcon}</span>}
                </div>
              </div>

              {/* Content */}
              <div style={{ marginTop: 12, paddingLeft: 48 }}>
                {p.title && (
                  <h3 className="font-semibold leading-[22px]" style={{ fontSize: 17, color: "var(--foreground)" }}>{p.title}</h3>
                )}
                {p.content && (
                  <p className="leading-[22px] clamp-3" style={{ fontSize: 15, color: "var(--muted)", marginTop: 4, overflowWrap: "anywhere" }}>
                    {p.content}
                  </p>
                )}
                <div className="flex items-center" style={{ gap: 20, marginTop: 12, color: "var(--muted)", fontSize: 13 }}>
                  <span>{postScore} applause</span>
                  <span>{p._count.comments} {p._count.comments === 1 ? "reply" : "replies"}</span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}

    </AppShell>
  );
}
