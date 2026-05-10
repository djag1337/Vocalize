import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      themeColor: true,
      accentColor: true,
      feedDensity: true,
      displayBadgeId: true,
      nowPlaying: true,
      badges: {
        include: {
          badge: {
            select: { id: true, slug: true, name: true, icon: true, color: true },
          },
        },
      },
    },
  });
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sticky back-nav */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/u/${user.username}`}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ←
          </Link>
          <span className="font-semibold text-[15px]">Settings</span>
        </div>
        <Link href={`/u/${user.username}`} className="btn-ghost text-xs py-1.5 px-4">
          View profile
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <SettingsForm initial={user} />
      </div>
    </main>
  );
}
