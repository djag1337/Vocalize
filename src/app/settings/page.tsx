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
      <div className="max-w-lg mx-auto" style={{ padding: "28px 20px 40px 20px" }}>
        <SettingsForm initial={user} />
      </div>
    </AppShell>
  );
}
