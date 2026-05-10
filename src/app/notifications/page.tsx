import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarkAllRead from "./MarkAllRead";
import AppShell from "@/components/AppShell";
import { Bell, MessageCircle, AtSign, ChevronUp, Shield, Info } from "lucide-react";

export const dynamic = "force-dynamic";

const ICON_MAP = {
  reply: MessageCircle,
  mention: AtSign,
  vote: ChevronUp,
  mod: Shield,
  system: Info,
} as const;

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { username: true, displayName: true, accentColor: true } },
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppShell username={session.user.name || ""}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-[15px]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && <MarkAllRead />}
      </header>

      <div className="px-4 py-4">
        {notifications.length === 0 ? (
          <div className="surface p-10 text-center mt-4">
            <Bell size={28} className="text-[var(--muted-2)] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-[14px]">nothing here yet</p>
            <p className="text-[var(--muted-2)] text-[12px] mt-1">replies, mentions, and mod actions will show up here</p>
          </div>
        ) : (
          <ul>
            {notifications.map(n => {
              const href = n.postId ? `/p/${n.postId}` : "#";
              const Icon = ICON_MAP[n.type as keyof typeof ICON_MAP] || Bell;
              return (
                <li key={n.id}>
                  <Link
                    href={href}
                    className={`flex items-start gap-3 py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--surface)]/30 ${
                      !n.read ? "bg-[var(--accent-soft)]" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-[var(--surface-3)] shrink-0">
                      <Icon size={16} strokeWidth={2} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] leading-snug">
                        {n.actor && (
                          <Link
                            href={`/u/${n.actor.username}`}
                            className="font-semibold hover:underline"
                            style={{ color: n.actor.accentColor || "var(--accent)" }}
                          >
                            @{n.actor.username}
                          </Link>
                        )}{" "}
                        <span className="text-[var(--muted)]">{n.message}</span>
                      </p>
                      <p className="text-[12px] text-[var(--muted-2)] mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
