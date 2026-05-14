import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────
   Empty state
───────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ padding: "72px 24px" }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          marginBottom: 20,
          borderRadius: 9999,
          background: "var(--surface-3)",
        }}
      >
        <Bookmark
          size={28}
          strokeWidth={1.5}
          style={{ color: "var(--muted)" }}
        />
      </div>
      <p
        className="font-bold"
        style={{ fontSize: 17, color: "var(--foreground)", marginBottom: 8 }}
      >
        Nothing saved yet
      </p>
      <p
        style={{ fontSize: 15, color: "var(--muted)", marginBottom: 24, maxWidth: 260 }}
      >
        Tap the bookmark on any post to save it here for later.
      </p>
      <Link
        href="/feed"
        className="font-bold hover:underline"
        style={{ fontSize: 15, color: "var(--accent)" }}
      >
        Browse the feed →
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const saves = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    include: {
      post: {
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
          reactions: { select: { emoji: true, userId: true } },
        },
      },
    },
  });

  const userId = session.user.id;
  const items = saves
    .filter((s) => !s.post.removed)
    .map((s) => ({
      savedAt: s.savedAt,
      post: {
        ...s.post,
        score: s.post.votes.reduce(
          (sum: number, v: { value: number }) => sum + v.value,
          0,
        ),
        myVote:
          s.post.votes.find(
            (v: { userId: string; value: number }) => v.userId === userId,
          )?.value ?? 0,
        commentCount: s.post._count.comments,
        saved: true,
      },
    }));

  return (
    <AppShell username={session.user.name || ""} title="Saved">
      {items.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "16px", paddingTop: "20px" }}>
          {items.map(({ post }) => (
            <PostCard key={post.id} post={post} myUserId={userId} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </AppShell>
  );
}
