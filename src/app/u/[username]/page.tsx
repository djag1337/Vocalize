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
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
      <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vocalize
          </Link>
          {isMe && (
            <Link href="/settings" className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs">
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
              style={{ background: `linear-gradient(135deg, ${user.themeColor}, ${user.accentColor})` }}
            />
          )}
          {/* Avatar — overlaps banner */}
          <div
            className="absolute bottom-0 left-6 translate-y-1/2 w-28 h-28 rounded-full border-4 flex items-center justify-center text-4xl font-bold overflow-hidden shrink-0"
            style={{ borderColor: "rgb(3 0 20)", background: user.themeColor }}
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
                <h1 className="text-2xl font-bold" style={{ color: user.accentColor }}>
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
              <p className="text-gray-400 text-sm">
                @{user.username} · joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.bio && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mt-4">
              <p className="text-gray-200 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {user.nowPlaying && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mt-4 flex items-center gap-3">
              {/* Animated equalizer bars */}
              <div className="flex items-end gap-[3px] h-5 shrink-0">
                {[3, 5, 4, 6, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full animate-bounce"
                    style={{
                      height: `${h * 3}px`,
                      background: user.accentColor,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "0.8s",
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
                  <div className="text-xs text-gray-400 mb-0.5">Now Playing</div>
                  <div className="text-sm font-medium text-white">{user.nowPlaying}</div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 mb-6">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold" style={{ color: user.accentColor }}>
                {user._count.posts}
              </div>
              <div className="text-xs text-gray-400">posts</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold" style={{ color: user.accentColor }}>
                {user._count.comments}
              </div>
              <div className="text-xs text-gray-400">comments</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold" style={{ color: user.accentColor }}>
                {user.badges.length}
              </div>
              <div className="text-xs text-gray-400">badges</div>
            </div>
          </div>

          {/* Badges — Discord-style role pills */}
          {user.badges.length > 0 && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6">
              <h2 className="text-sm font-semibold mb-3 text-gray-300">Badges</h2>
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
                    <span
                      className="opacity-60 text-[10px] font-normal ml-0.5"
                      style={{ color: b.badge.color }}
                    >
                      {rarityLabel[b.badge.rarity] ?? b.badge.rarity}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          <h2 className="text-lg font-semibold mb-3">Posts</h2>
          {user.posts.length === 0 ? (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center text-gray-400 mb-6">
              no posts yet
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {user.posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="block bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    {p.community && (
                      <span
                        className="font-medium"
                        style={{ color: p.community.themeColor || "#ec4899" }}
                      >
                        c/{p.community.slug}
                      </span>
                    )}
                    <span>· {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold">{p.title}</h3>
                  {p.content && (
                    <p className="text-sm text-gray-300 line-clamp-2 mt-1">{p.content}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
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
