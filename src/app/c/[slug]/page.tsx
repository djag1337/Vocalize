import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
import JoinButton from "./JoinButton";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
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
    orderBy:
      sortMode === "top"
        ? { votes: { _count: "desc" } }
        : { createdAt: "desc" },
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

  const accent = community.themeColor || "var(--accent)";

  return (
    <AppShell username={session.user.name || ""} title={community.name}>

      {/* ── Community header card ── */}
      <div style={{ padding: "16px 16px 8px" }}>
        <div
          style={{
            background: "var(--surface-3)",
            borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            padding: "22px 22px 20px",
          }}
        >
          {/* Top row: avatar + name + join */}
          <div className="flex items-start justify-between" style={{ gap: 16 }}>
            <div className="flex items-center" style={{ gap: 14 }}>
              <div
                className="flex items-center justify-center font-bold shrink-0"
                style={{
                  width: 54, height: 54, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${accent}99, ${accent})`,
                  fontSize: 22, color: "#fff",
                }}
              >
                {community.name[0]}
              </div>
              <div>
                <h1 className="font-bold" style={{ fontSize: 20, lineHeight: "1.2", color: "var(--foreground)" }}>
                  {community.name}
                </h1>
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 3 }}>
                  s/{community.slug}
                </p>
              </div>
            </div>
            <JoinButton
              slug={community.slug}
              initiallyJoined={!!membership}
              accent={accent}
            />
          </div>

          {/* Description */}
          {community.description && (
            <p
              style={{ fontSize: 15, lineHeight: "1.5", marginTop: 16, color: "var(--foreground)" }}
            >
              {community.description}
            </p>
          )}

          {/* Meta */}
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>
            {community._count.members.toLocaleString()} members
            {" · "}
            {community._count.posts} posts
            {" · "}
            by{" "}
            <Link
              href={`/u/${community.owner.username}`}
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              &{community.owner.username}
            </Link>
          </p>

          {/* Accent strip */}
          <div
            style={{ height: 3, background: accent, marginTop: 18, opacity: 0.7, borderRadius: 9999 }}
          />
        </div>
      </div>

      {/* ── Sort tabs ── */}
      <div
        className="flex"
        style={{ marginTop: 8, borderBottom: "1px solid var(--border)" }}
      >
        {(["new", "top"] as const).map(mode => (
          <Link
            key={mode}
            href={`/c/${community.slug}?sort=${mode}`}
            className="flex-1 text-center transition"
            style={{
              padding: "12px 0",
              fontSize: 13,
              fontWeight: sortMode === mode ? 600 : 400,
              color: sortMode === mode ? "var(--foreground)" : "var(--muted)",
              borderBottom: sortMode === mode ? `2px solid ${accent}` : "2px solid transparent",
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Link>
        ))}
      </div>

      {/* ── Posts or empty state ── */}
      {shaped.length === 0 ? (
        <div
          className="text-center"
          style={{
            background: "var(--surface-3)",
            borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            margin: "16px",
            padding: "48px 24px",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
          <p
            className="font-bold"
            style={{ fontSize: 17, marginBottom: 8, color: "var(--foreground)" }}
          >
            No posts yet — be the first!
          </p>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 24 }}>
            Share something with {community.name}
          </p>
          <Link
            href={`/submit?c=${community.slug}`}
            className="inline-block font-medium"
            style={{ background: accent, padding: "10px 28px", fontSize: 14, borderRadius: 9999, color: "#fff" }}
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="flex flex-col" style={{ padding: "16px", gap: 16 }}>
          {shaped.map(p => (
            <PostCard key={p.id} post={p} myUserId={userId} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
