import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import Link from "next/link";
import AppShell from "@/components/AppShell";

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
      backgroundColor: true,
      cardColor: true,
      foregroundColor: true,
      mutedColor: true,
      borderColor: true,
      sidebarColor: true,
      fontFamily: true,

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
    <AppShell username={session.user.name || user.username} title="Settings">
      {/* Preload all font options so the font picker cards render correctly */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Geist:wght@400;500;600;700;900&family=Playfair+Display:wght@400;500;600;700;900&family=DM+Sans:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" />
      <div className="max-w-lg mx-auto" style={{ padding: "28px 20px 40px 20px" }}>
        <SettingsForm initial={user} />
      </div>
    </AppShell>
  );
}
