import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Shield,
  Users,
  FileText,
  Hash,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import BadgeManager from "./BadgeManager";

export const dynamic = "force-dynamic";

const ADMIN_USERNAME = "djagdev";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.name?.toLowerCase() !== ADMIN_USERNAME) {
    return (
      <AppShell username={session.user.name || ""} title="Admin">
        <div
          style={{
            maxWidth: 480,
            margin: "100px auto",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Shield size={28} color="#fca5a5" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            403 — Forbidden
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            You don&apos;t have permission to access the admin panel.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 999,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Go home
          </Link>
        </div>
      </AppShell>
    );
  }

  // ── Fetch all data in parallel ──────────────────────────────────────────
  const [
    totalUsers,
    totalPosts,
    totalSpaces,
    totalOpenReports,
    totalComments,
    users,
    spaces,
    openReports,
    allBadges,
    recentPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count({ where: { removed: false } }),
    prisma.community.count(),
    prisma.report.count({ where: { status: "open" } }),
    prisma.comment.count({ where: { removed: false } }),

    // All users with post/comment counts
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        accentColor: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
    }),

    // All spaces with member & post counts
    prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        themeColor: true,
        owner: { select: { username: true } },
        _count: { select: { members: true, posts: true } },
      },
    }),

    // Open reports globally
    prisma.report.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reporter: { select: { username: true } },
        post: { select: { id: true, title: true } },
        comment: { select: { id: true, content: true, postId: true } },
      },
    }),

    // All badges
    prisma.badge.findMany({
      orderBy: { createdAt: "asc" },
    }),

    // Recent posts (last 25)
    prisma.post.findMany({
      where: { removed: false },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: { username: true, accentColor: true } },
        community: { select: { slug: true, name: true, themeColor: true } },
        _count: { select: { comments: true, votes: true } },
        votes: { select: { value: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Users", value: totalUsers, icon: Users, color: "#a855f7" },
    { label: "Posts", value: totalPosts, icon: FileText, color: "#3b82f6" },
    { label: "Spaces", value: totalSpaces, icon: Hash, color: "#10b981" },
    { label: "Open Reports", value: totalOpenReports, icon: AlertCircle, color: "#ef4444" },
    { label: "Comments", value: totalComments, icon: MessageSquare, color: "#f59e0b" },
  ];

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const sectionHeader = (icon: React.ReactNode, title: string, count?: number) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: "1px solid var(--border)",
      }}
    >
      {icon}
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
      {count !== undefined && (
        <span
          style={{
            fontSize: 12,
            color: "var(--muted)",
            background: "var(--surface-3)",
            padding: "2px 8px",
            borderRadius: 999,
            fontWeight: 500,
          }}
        >
          {count}
        </span>
      )}
    </div>
  );

  const emptyState = (msg: string) => (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
        color: "var(--muted)",
        fontSize: 14,
      }}
    >
      {msg}
    </div>
  );

  return (
    <AppShell username={session.user.name || ""} title="Admin">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px 64px" }}>

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #a855f788, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={22} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>
              Platform overview &amp; controls
            </p>
          </div>
        </div>

        {/* ── Platform Overview ────────────────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          {sectionHeader(
            <TrendingUp size={16} style={{ color: "var(--accent)" }} />,
            "Platform Overview"
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={16} color={s.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>
                      {s.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, fontWeight: 500 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Open Reports ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          {sectionHeader(
            <AlertCircle size={16} style={{ color: "#ef4444" }} />,
            "Open Reports",
            openReports.length
          )}
          {openReports.length === 0 ? (
            emptyState("No open reports — all clear 🎉")
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
              {openReports.map((r) => {
                const isPost = !!r.postId && !!r.post;
                const isComment = !!r.commentId && !!r.comment;
                const kind = isPost ? "post" : isComment ? "comment" : "unknown";
                const preview = isPost
                  ? r.post!.title
                  : isComment
                  ? r.comment!.content.slice(0, 100)
                  : "(deleted)";
                const href = isPost
                  ? `/p/${r.post!.id}`
                  : isComment
                  ? `/p/${r.comment!.postId}#c-${r.comment!.id}`
                  : "#";

                return (
                  <li
                    key={r.id}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 6, flexWrap: "wrap" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "rgba(239,68,68,0.12)",
                              color: "#fca5a5",
                              border: "1px solid rgba(239,68,68,0.2)",
                              fontWeight: 600,
                            }}
                          >
                            {kind}
                          </span>
                          <span style={{ color: "var(--muted-2)" }}>by</span>
                          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>&{r.reporter.username}</span>
                          <span style={{ color: "var(--muted-2)" }}>·</span>
                          <Clock size={11} />
                          <span>{fmt(r.createdAt)}</span>
                        </div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: 4,
                          }}
                        >
                          {preview}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                          <span style={{ color: "var(--muted-2)", fontWeight: 500 }}>Reason: </span>
                          {r.reason}
                          {r.details && (
                            <span style={{ color: "var(--muted-2)" }}> — {r.details}</span>
                          )}
                        </p>
                      </div>
                      {href !== "#" && (
                        <Link
                          href={href}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--accent)",
                            flexShrink: 0,
                            paddingTop: 2,
                          }}
                        >
                          view <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                    {/* Action buttons (stubbed) */}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button
                        type="button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: "1px solid var(--border)",
                          background: "transparent",
                          color: "var(--muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle size={12} /> Dismiss
                      </button>
                      <button
                        type="button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "rgba(239,68,68,0.08)",
                          color: "#fca5a5",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <XCircle size={12} /> Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Users ────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          {sectionHeader(
            <Users size={16} style={{ color: "#a855f7" }} />,
            "All Users",
            users.length
          )}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {users.map((u, i) => {
              const color = u.accentColor || "#a855f7";
              return (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {/* Gradient avatar */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: `linear-gradient(135deg, ${color}88, ${color})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {u.username[0].toUpperCase()}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/u/${u.username}`}
                      style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}
                    >
                      &{u.username}
                    </Link>
                    {u.displayName && (
                      <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 6 }}>
                        {u.displayName}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontSize: 12,
                      color: "var(--muted)",
                      flexShrink: 0,
                    }}
                  >
                    <span title="Posts">
                      <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{u._count.posts}</span> posts
                    </span>
                    <span title="Comments">
                      <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{u._count.comments}</span> comments
                    </span>
                    <span style={{ color: "var(--muted-2)" }}>{fmt(u.createdAt)}</span>
                  </div>

                  {/* Ban (stubbed) */}
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.07)",
                      color: "#fca5a5",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Ban size={11} /> Ban
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Spaces ───────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          {sectionHeader(
            <Hash size={16} style={{ color: "#10b981" }} />,
            "All Spaces",
            spaces.length
          )}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {spaces.length === 0 ? (
              <div style={{ padding: "28px 24px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                No spaces yet
              </div>
            ) : (
              spaces.map((s, i) => {
                const color = s.themeColor || "#a855f7";
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom: i < spaces.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {/* Color swatch */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${color}88, ${color})`,
                        flexShrink: 0,
                      }}
                    />

                    {/* Name + slug */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={`/c/${s.slug}`}
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "var(--foreground)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {s.name}
                        <ExternalLink size={11} style={{ color: "var(--muted)" }} />
                      </Link>
                      <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0" }}>
                        s/{s.slug} · owned by{" "}
                        <Link
                          href={`/u/${s.owner.username}`}
                          style={{ color: color, fontWeight: 600 }}
                        >
                          &{s.owner.username}
                        </Link>
                      </p>
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        fontSize: 12,
                        color: "var(--muted)",
                        flexShrink: 0,
                      }}
                    >
                      <span>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{s._count.members}</span> members
                      </span>
                      <span>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{s._count.posts}</span> posts
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── Badge Management ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          <BadgeManager allBadges={allBadges} />
        </section>

        {/* ── Recent Posts ─────────────────────────────────────────────── */}
        <section>
          {sectionHeader(
            <FileText size={16} style={{ color: "#3b82f6" }} />,
            "Recent Posts",
            recentPosts.length
          )}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {recentPosts.length === 0 ? (
              <div style={{ padding: "28px 24px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                No posts yet
              </div>
            ) : (
              recentPosts.map((p, i) => {
                const score = p.votes.reduce((acc, v) => acc + v.value, 0);
                const authorColor = p.author.accentColor || "#a855f7";
                const spaceColor = p.community?.themeColor || "#a855f7";
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom: i < recentPosts.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {/* Score pill */}
                    <div
                      style={{
                        minWidth: 40,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: score > 0 ? "#34d399" : score < 0 ? "#fca5a5" : "var(--muted)",
                        flexShrink: 0,
                      }}
                    >
                      {score > 0 ? "+" : ""}{score}
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={`/p/${p.id}`}
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "var(--foreground)",
                        }}
                      >
                        {p.title}
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ color: authorColor, fontWeight: 600 }}>&{p.author.username}</span>
                        {p.community && (
                          <>
                            <span style={{ color: "var(--muted-2)" }}>in</span>
                            <Link
                              href={`/c/${p.community.slug}`}
                              style={{ color: spaceColor, fontWeight: 600 }}
                            >
                              s/{p.community.slug}
                            </Link>
                          </>
                        )}
                        <span style={{ color: "var(--muted-2)" }}>·</span>
                        <span style={{ color: "var(--muted)" }}>{p._count.comments} comments</span>
                        <span style={{ color: "var(--muted-2)" }}>·</span>
                        <span style={{ color: "var(--muted-2)" }}>{fmt(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </AppShell>
  );
}
