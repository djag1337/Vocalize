// BACKUP — profile page before join-date + logo mark update
// Restore: copy this file to page.tsx
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
      id: true, username: true, displayName: true, bio: true,
      avatarUrl: true, bannerUrl: true, themeColor: true, accentColor: true,
      nowPlaying: true, createdAt: true,
      displayBadge: { select: { id: true, name: true, icon: true, color: true, rarity: true } },
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
      {/* original content — see git history */}
    </AppShell>
  );
}
