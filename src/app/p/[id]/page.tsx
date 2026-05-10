import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import VoteButtons from "@/components/VoteButtons";
import CommentSection from "./CommentSection";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
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
      votes: { select: { value: true, userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { username: true, accentColor: true } },
        },
      },
    },
  });

  if (!post) notFound();

  const userId = session.user.id;
  const score = post.votes.reduce((s, v) => s + v.value, 0);
  const myVote = post.votes.find(v => v.userId === userId)?.value ?? 0;

  const accentColor = post.author.accentColor;
  const avatarInitial = (post.author.displayName || post.author.username)[0]?.toUpperCase();

  function timeAgo(d: Date) {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return d.toLocaleDateString();
  }

  return (
    <AppShell username={session.user.name || ""}>
      {/* Sticky back-nav header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ←
        </Link>
        <span className="font-semibold text-[15px]">Post</span>
      </header>

      <div className="px-4 py-5">
        {/* Author row */}
        <div className="flex items-center gap-2.5 mb-4">
          <Link href={`/u/${post.author.username}`} className="hover:opacity-90 shrink-0">
            <span
              className="avatar"
              style={{
                width: 38,
                height: 38,
                fontSize: 14,
                background: accentColor
                  ? `linear-gradient(135deg, ${accentColor}88, ${accentColor})`
                  : undefined,
              }}
            >
              {avatarInitial}
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] flex-wrap">
            <Link href={`/u/${post.author.username}`} className="font-semibold text-[var(--foreground)] hover:underline">
              {post.author.displayName || post.author.username}
            </Link>
            {post.author.displayBadge && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: `${post.author.displayBadge.color}26`,
                  color: post.author.displayBadge.color,
                }}
              >
                <span>{post.author.displayBadge.icon}</span>
                <span>{post.author.displayBadge.name}</span>
              </span>
            )}
            <span className="text-[var(--muted-2)]">@{post.author.username}</span>
            {post.community && (
              <>
                <span>·</span>
                <Link
                  href={`/c/${post.community.slug}`}
                  className="hover:underline font-medium"
                  style={{ color: post.community.themeColor || "var(--accent)" }}
                >
                  c/{post.community.slug}
                </Link>
              </>
            )}
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        {/* Post content */}
        <h1 className="text-2xl font-bold leading-snug text-[var(--foreground)]">{post.title}</h1>
        {post.content && (
          <p className="text-[16px] leading-relaxed text-[var(--muted)] mt-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Vote action row */}
        <div className="flex items-center gap-2 mt-5">
          <VoteButtons postId={post.id} initialScore={score} initialVote={myVote} />
        </div>

        {/* Divider */}
        <div className="feed-divider mt-6 mb-6" />

        <CommentSection
          postId={post.id}
          initialComments={post.comments.map(c => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            author: c.author,
          }))}
        />
      </div>
    </AppShell>
  );
}
