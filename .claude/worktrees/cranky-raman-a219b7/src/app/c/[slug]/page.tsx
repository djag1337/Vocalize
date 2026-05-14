import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
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
    where: { communityId: community.id, removed: false },
    orderBy: sortMode === "top" ? { votes: { _count: "desc" } } : { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          accentColor: true,
          displayBadge: { select: { name: true, icon: true, color: true } },
        },
      },
      community: { select: { slug: true, name: true, themeColor: true } },
      flair: { select: { name: true, color: true } },
      _count: { select: { comments: true } },
      votes: { select: { value: true, userId: true } },
      saves: { where: { userId }, select: { id: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });

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

  const accent = community.themeColor || "var(--accent)";

  return (
    <AppShell username={session.user.name || ""}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ←
          </Link>
          <span className="font-semibold text-[15px]" style={{ color: accent }}>
            c/{community.slug}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/c" className="btn-ghost text-xs py-1.5 px-3">Communities</Link>
          <Link
            href={`/submit?c=${community.slug}`}
            className="pill pill-primary text-xs"
          >
            + Post
          </Link>
        </div>
      </header>

      {/* Community info */}
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold" style={{ color: accent }}>
              c/{community.slug}
            </h1>
            <p className="text-[var(--muted)] text-[14px] mt-0.5">{community.name}</p>
            {community.description && (
              <p className="text-[var(--muted)] text-[13px] mt-2">{community.description}</p>
            )}
            <p className="text-[12px] text-[var(--muted-2)] mt-2">
              {community._count.members} members · {community._count.posts} posts · owned by @{community.owner.username}
            </p>
          </div>
          <JoinButton slug={community.slug} initiallyJoined={!!membership} accent={accent} />
        </div>
      </div>

      {/* Sort tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(["new", "top"] as const).map(mode => (
          <Link
            key={mode}
            href={`/c/${community.slug}?sort=${mode}`}
            className={`flex-1 text-center py-3 text-[13px] border-b-2 transition ${
              sortMode === mode
                ? "border-[var(--accent)] text-[var(--foreground)] font-semibold"
                : "border-transparent text-[var(--muted)] hover:bg-[var(--surface)]"
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Link>
        ))}
      </div>

      {/* Posts */}
      {shaped.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-[var(--muted)] text-[14px] mb-2">no posts here yet</p>
          <Link href={`/submit?c=${community.slug}`} className="text-[var(--accent)] hover:underline text-[13px]">
            be the first →
          </Link>
        </div>
      ) : (
        <div>
          {shaped.map(p => (
            <PostCard key={p.id} post={p} myUserId={userId} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
