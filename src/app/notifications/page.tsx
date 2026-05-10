import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarkAllRead from "./MarkAllRead";
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
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
      <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
          <Link href="/feed" className="text-sm text-gray-300 hover:text-white">← Feed</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-pink-400" strokeWidth={2} />
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-gray-400 text-sm">{unreadCount > 0 ? `${unreadCount} unread` : "all caught up"}</p>
            </div>
          </div>
          {unreadCount > 0 && <MarkAllRead />}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
            <Bell size={32} className="text-gray-500 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-gray-300">nothing here yet</p>
            <p className="text-gray-500 text-sm mt-2">replies, mentions, and mod actions will show up here</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map(n => {
              const href = n.postId ? `/p/${n.postId}` : "#";
              const Icon = ICON_MAP[n.type as keyof typeof ICON_MAP] || Bell;
              return (
                <li key={n.id}>
                  <Link
                    href={href}
                    className={`block rounded-2xl p-4 border transition ${
                      n.read
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-pink-500/10 border-pink-500/30 hover:border-pink-500/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-full bg-white/5">
                        <Icon size={18} strokeWidth={2} className="text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {n.actor && (
                            <Link href={`/u/${n.actor.username}`} className="font-semibold hover:underline" style={{ color: n.actor.accentColor || "#ec4899" }}>
                              @{n.actor.username}
                            </Link>
                          )}{" "}
                          <span className="text-gray-300">{n.message}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-pink-400 mt-2 shrink-0" />}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
