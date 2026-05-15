import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import VoteButtons from "@/components/VoteButtons";
import CommentSection from "./CommentSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import DeletePostButton from "./DeletePostButton";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      title: true,
      content: true,
      author: { select: { displayName: true, username: true } },
      community: { select: { slug: true, name: true } },
    },
  });
  if (!post) return { title: "Post — Vocalize" };

  const author = post.author.displayName || post.author.username;
  const space = post.community ? ` · s/${post.community.slug}` : "";
  const description = post.content
    ? post.content.slice(0, 160).replace(/\n/g, " ")
    : `By ${author}${space} on Vocalize`;

  return {
    title: `${post.title || "Post"} — Vocalize`,
    description,
    openGraph: {
      title: post.title || "Post on Vocalize",
      description,
      siteName: "Vocalize",
      type: "article",
    },
    twitter: {
      card: "summary",
      title: post.title || "Post on Vocalize",
      description,
    },
  };
}

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
  const isAdmin = session.user.name?.toLowerCase() === "djagdev";
  const canDelete = userId === post.author.id || isAdmin;
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
    <AppShell username={session.user.name || ""} title="Post">
      <div style={{ padding: "16px 16px 32px 16px" }}>

        {/* ── Main post card ── */}
        <div
          style={{
            background: "var(--surface-3)",
            borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            padding: "24px 24px 0 24px",
          }}
        >
          {/* Author row */}
          <div className="flex items-start" style={{ gap: "14px", position: "relative" }}>
            <Link href={`/u/${post.author.username}`} className="shrink-0">
              <div
                className="flex items-center justify-center font-bold"
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  color: "#fff", fontSize: 15,
                  background: accentColor
                    ? `linear-gradient(135deg, ${accentColor}88, ${accentColor})`
                    : "linear-gradient(135deg, var(--accent-2), var(--accent))",
                }}
              >
                {avatarInitial}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              {/* Name + badge row */}
              <div className="flex items-center flex-wrap" style={{ gap: "6px", paddingRight: canDelete ? "40px" : "0" }}>
                <Link
                  href={`/u/${post.author.username}`}
                  className="font-semibold hover:underline"
                  style={{ fontSize: 15, color: "var(--foreground)" }}
                >
                  {post.author.displayName || post.author.username}
                </Link>
                {post.author.displayBadge && (
                  <span
                    className="inline-flex items-center font-medium"
                    style={{ fontSize: 12, color: post.author.displayBadge.color }}
                  >
                    {post.author.displayBadge.icon}
                  </span>
                )}
              </div>
              {/* Meta row */}
              <div className="flex items-center flex-wrap" style={{ fontSize: 13, color: "var(--muted)", gap: "6px", marginTop: "2px" }}>
                <span>@{post.author.username}</span>
                {post.community && (
                  <>
                    <span>·</span>
                    <Link href={`/c/${post.community.slug}`} className="hover:underline">
                      s/{post.community.slug}
                    </Link>
                  </>
                )}
                <span>·</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            {canDelete && (
              <div style={{ position: "absolute", top: 0, right: 0 }}>
                <DeletePostButton postId={post.id} />
              </div>
            )}
          </div>

          {/* Post title + body */}
          <div style={{ marginTop: "18px" }}>
            <h1 className="font-bold leading-snug" style={{ fontSize: 17, color: "var(--foreground)" }}>
              {post.title}
            </h1>
            {post.content && (
              <div style={{ fontSize: 15, color: "var(--foreground)", marginTop: 10, overflowWrap: "anywhere" }}>
                <MarkdownRenderer content={post.content} />
              </div>
            )}
            {/* Image attachment */}
            {(post as {postType?: string; imageUrl?: string | null}).postType === "image" &&
             (post as {imageUrl?: string | null}).imageUrl && (
              <div className="overflow-hidden" style={{ marginTop: 14, borderRadius: 16 }}>
                <img
                  src={(post as {imageUrl: string}).imageUrl}
                  alt=""
                  style={{ width: "100%", maxHeight: 520, objectFit: "contain", display: "block", background: "var(--card)" }}
                />
              </div>
            )}
            {/* Music attachment */}
            {(post as {postType?: string; musicUrl?: string | null}).postType === "music" &&
             (post as {musicUrl?: string | null}).musicUrl && (() => {
              const url = (post as {musicUrl: string}).musicUrl;
              const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
              if (!m) return null;
              const embedUrl = `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
              return (
                <div className="overflow-hidden" style={{ marginTop: 14, borderRadius: 16 }}>
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    style={{ display: "block", borderRadius: 16 }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Stats row */}
          <div
            className="flex items-center"
            style={{ marginTop: "20px", paddingTop: "14px", paddingBottom: "16px", gap: "10px", borderTop: "1px solid var(--border)" }}
          >
            <VoteButtons postId={post.id} initialScore={score} initialVote={myVote} />
            <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: "4px" }}>
              {post.comments.length}{" "}
              {post.comments.length === 1 ? "reply" : "replies"}
            </span>
          </div>
        </div>

        {/* ── Comments section ── */}
        <div style={{ marginTop: "24px" }}>
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
      </div>
    </AppShell>
  );
}
