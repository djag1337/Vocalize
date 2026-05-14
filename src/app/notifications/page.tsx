import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarkAllRead from "./MarkAllRead";
import AppShell from "@/components/AppShell";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

// ── Demo fallback data shown when the DB is empty ─────────────────────────────
interface DemoNotification {
  id: string;
  type: "like" | "reply" | "badge" | "follow" | "thread_reply" | "mention";
  actorName: string;
  actorInitials: string;
  actorColor: string;
  message: string;
  timestamp: string;
  unread: boolean;
  href: string;
}

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: "d1", type: "like", actorName: "maya_w", actorInitials: "MW", actorColor: "#9b6dff", message: "liked your post about tabs vs spaces", timestamp: "2m", unread: true, href: "#" },
  { id: "d2", type: "follow", actorName: "rjones", actorInitials: "RJ", actorColor: "#ff6b6b", message: "started following you", timestamp: "14m", unread: true, href: "#" },
  { id: "d3", type: "reply", actorName: "tobiasz", actorInitials: "TB", actorColor: "#4ecdc4", message: "replied to your post about lo-fi playlists for coding", timestamp: "1h", unread: true, href: "#" },
  { id: "d4", type: "badge", actorName: "Vocalize", actorInitials: "VZ", actorColor: "#f7c948", message: "awarded you the Early Adopter badge 🏅", timestamp: "3h", unread: false, href: "#" },
  { id: "d5", type: "mention", actorName: "priya_dev", actorInitials: "PD", actorColor: "#ff9f43", message: "mentioned you in a post about Neovim in 2026", timestamp: "5h", unread: false, href: "#" },
  { id: "d6", type: "thread_reply", actorName: "kira.sol", actorInitials: "KS", actorColor: "#48dbfb", message: "replied to a thread you are in -- midnight commit gang 🌙", timestamp: "1d", unread: false, href: "#" },
  { id: "d7", type: "like", actorName: "axl99", actorInitials: "AX", actorColor: "#1dd1a1", message: "liked your comment about TypeScript", timestamp: "2d", unread: false, href: "#" },
  { id: "d8", type: "thread_reply", actorName: "chloe.m", actorInitials: "CM", actorColor: "#c56cf0", message: "replied to your thread -- ship it friday, regret it monday", timestamp: "3d", unread: false, href: "#" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Avatar circle with initials ───────────────────────────────────────────────
function AvatarCircle({
  initials,
  color,
  size = 40,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        background: color + "22",
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbNotifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { username: true, displayName: true, accentColor: true } },
    },
  });

  const hasReal = dbNotifications.length > 0;
  const unreadCount = dbNotifications.filter((n) => !n.read).length;

  return (
    <AppShell username={session.user.name || ""} title="Notifications">
      <div
        style={{
          padding: "16px 16px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Mark-all-read button -- only when there are real unread notifications */}
        {hasReal && unreadCount > 0 && <MarkAllRead />}

        {/* ── Section header ── */}
        <p
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: 2,
            marginTop: 4,
          }}
        >
          {hasReal ? "Recent" : "Recent -- demo preview"}
        </p>

        {/* ── Real notifications ── */}
        {hasReal &&
          dbNotifications.map((n) => {
            const href = n.postId ? `/p/${n.postId}` : "#";
            const initials = (
              n.actor?.displayName ||
              n.actor?.username ||
              "?"
            )
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const color = n.actor?.accentColor || "var(--accent)";
            return (
              <Link
                key={n.id}
                href={href}
                className="flex items-center hover:opacity-80 transition-opacity"
                style={{
                  padding: "14px 18px",
                  gap: 14,
                  background: "var(--surface-3)",
                  borderRadius: 24,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  borderLeft: !n.read
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                  textDecoration: "none",
                }}
              >
                <AvatarCircle initials={initials} color={typeof color === "string" ? color : "var(--accent)"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, color: "var(--foreground)", lineHeight: "22px", margin: 0 }}>
                    <span style={{ fontWeight: 600, color: typeof color === "string" ? color : "var(--accent)" }}>
                      @{n.actor?.username}
                    </span>{" "}
                    <span style={{ color: "var(--muted)" }}>{n.message}</span>
                  </p>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3, margin: 0 }}>
                    {relativeTime(new Date(n.createdAt))} ago
                  </p>
                </div>
                {!n.read && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      minWidth: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                )}
              </Link>
            );
          })}

        {/* ── Demo notifications (shown when DB is empty) ── */}
        {!hasReal &&
          DEMO_NOTIFICATIONS.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className="flex items-center hover:opacity-80 transition-opacity"
              style={{
                padding: "14px 18px",
                gap: 14,
                background: "var(--surface-3)",
                borderRadius: 24,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                borderLeft: n.unread
                  ? "3px solid var(--accent)"
                  : "3px solid transparent",
                textDecoration: "none",
              }}
            >
              <AvatarCircle initials={n.actorInitials} color={n.actorColor} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, color: "var(--foreground)", lineHeight: "22px", margin: 0 }}>
                  <span style={{ fontWeight: 600, color: n.actorColor }}>
                    @{n.actorName}
                  </span>{" "}
                  <span style={{ color: "var(--muted)" }}>{n.message}</span>
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3, margin: 0 }}>
                  {n.timestamp} ago
                </p>
              </div>
              {n.unread && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    minWidth: 8,
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
              )}
            </Link>
          ))}

        {/* ── True empty state (real user, no notifications) ── */}
        {hasReal && dbNotifications.length === 0 && (
          <div
            className="flex flex-col items-center"
            style={{
              padding: "48px 32px",
              background: "var(--surface-3)",
              borderRadius: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              marginTop: 8,
              gap: 12,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--surface-3)",
                border: "1.5px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={24} strokeWidth={1.5} style={{ color: "var(--muted)" }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
              You&apos;re all caught up
            </p>
            <p style={{ fontSize: 15, color: "var(--muted)", margin: 0, maxWidth: 260 }}>
              Replies, mentions, and activity will appear here.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
