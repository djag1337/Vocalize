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

  // For "For you" tab: show posts from joined spaces first, fall back to all if none joined
  let forYouFilter: { communityId?: { in: string[] } } = {};
  if (sortMode === "new") {
    const memberships = await prisma.communityMember.findMany({
      where: { userId: session.user.id },
      select: { communityId: true },
    });
    if (memberships.length > 0) {
      forYouFilter = { communityId: { in: memberships.map(m => m.communityId) } };
    }
  }

  const posts = await prisma.post.findMany({
    where: { removed: false, ...forYouFilter },
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
    postType: p.postType,
    imageUrl: p.imageUrl,
    musicUrl: p.musicUrl,
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
    { mode: "new", label: "For you" },
    { mode: "hot", label: "Trending" },
    { mode: "top", label: "Top" },
  ];

  return (
    <AppShell username={session.user.name || ""}>
      <div className="sticky top-0 z-10 bg-[var(--background)]/85 backdrop-blur-xl -mx-4 md:-mx-6 px-4 md:px-6 border-b border-[var(--border)]">
        <div className="flex">
          {tabs.map(t => (
            <Link
              key={t.mode}
              href={`/feed?sort=${t.mode}`}
              className={`flex-1 h-[48px] flex items-center justify-center text-[15px] font-semibold transition-all ${
                sortMode === t.mode
                  ? "border-b border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-b border-[rgba(243,245,247,0.15)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {shaped.length === 0 ? (
        <div style={{ padding: "64px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 8 }}>
            {sortMode === "new" && Object.keys(forYouFilter).length > 0
              ? "No posts from your spaces yet."
              : "Nothing here yet."}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {sortMode === "new" && Object.keys(forYouFilter).length > 0 && (
              <Link href="/c" style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none", borderBottom: "1px solid var(--border)" }}>
                Explore more spaces
              </Link>
            )}
            <Link href="/submit" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
              Post something →
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 pt-10">
          {shaped.map(p => <PostCard key={p.id} post={p} myUserId={userId} />)}
        </div>
      )}
    </AppShell>
  );
}
