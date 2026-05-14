import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

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
    .filter(s => !s.post.removed)
    .map(s => ({
      savedAt: s.savedAt,
      post: {
        ...s.post,
        score: s.post.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
        myVote: s.post.votes.find((v: { userId: string; value: number }) => v.userId === userId)?.value ?? 0,
        commentCount: s.post._count.comments,
        saved: true,
      },
    }));

  return (
    <AppShell username={session.user.name || ""}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Bookmark size={18} strokeWidth={2} className="text-[var(--muted)]" />
        <h1 className="font-bold text-[15px]">Saved</h1>
      </header>

      {items.length === 0 ? (
        <div className="p-10 text-center">
          <Bookmark size={28} className="text-[var(--muted-2)] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[var(--muted)] text-[14px] mb-1">no saved posts yet</p>
          <p className="text-[var(--muted-2)] text-[12px] mb-3">tap the bookmark on any post to save it</p>
          <Link href="/feed" className="text-[var(--accent)] hover:underline text-[13px]">browse the feed →</Link>
        </div>
      ) : (
        <div>
          {items.map(({ post }) => (
            <PostCard key={post.id} post={post} myUserId={userId} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
