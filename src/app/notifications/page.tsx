import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarkAllRead from "./MarkAllRead";
import AppShell from "@/components/AppShell";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

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

  const hasNotifications = dbNotifications.length > 0;
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
        {/* Mark-all-read button -- only when there are unread notifications */}
        {hasNotifications && unreadCount > 0 && <MarkAllRead />}

        {/* ── Section header ── */}
        {hasNotifications && (
          <p
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--foreground)",
              marginBottom: 2,
              marginTop: 4,
            }}
          >
            Recent
          </p>
        )}

        {/* ── Notifications ── */}
        {hasNotifications &&
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
                      &{n.actor?.username}
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

        {/* ── Empty state ── */}
        {!hasNotifications && (
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
