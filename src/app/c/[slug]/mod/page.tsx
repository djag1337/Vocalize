import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Shield, AlertCircle, ArrowLeft, ExternalLink, Tag } from "lucide-react";
import ModActions from "./ModActions";
import FlairManager from "./FlairManager";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function ModPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, themeColor: true, ownerId: true },
  });
  if (!community) notFound();

  // verify user is a mod
  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
    select: { role: true },
  });
  const isMod = member?.role === "mod" || member?.role === "owner" || community.ownerId === session.user.id;

  if (!isMod) {
    return (
      <AppShell username={session.user.name || ""} title="Mod Tools">
        <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <Shield size={48} style={{ color: "var(--muted)", margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Mods only</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>You don&apos;t have permission to view this page.</p>
          <Link
            href={`/c/${slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontSize: 14,
            }}
          >
            <ArrowLeft size={14} /> Back to c/{slug}
          </Link>
        </div>
      </AppShell>
    );
  }

  const [reports, modActions, removedPosts] = await Promise.all([
    prisma.report.findMany({
      where: { communityId: community.id, status: "open" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { select: { username: true } },
      },
    }),
    prisma.modAction.findMany({
      where: { communityId: community.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        mod: { select: { username: true, accentColor: true } },
      },
    }),
    prisma.post.findMany({
      where: { communityId: community.id, removed: true },
      orderBy: { updatedAt: "desc" },
      take: 25,
      select: { id: true, title: true, removedReason: true, updatedAt: true, author: { select: { username: true } } },
    }),
  ]);

  // hydrate report targets
  const reportRows = await Promise.all(
    reports.map(async (r) => {
      let target: {
        kind: "post" | "comment" | "unknown";
        id: string;
        preview: string;
        href: string;
        postContent?: string;
      } = {
        kind: "unknown", id: "", preview: "(deleted)", href: "#",
      };
      if (r.postId) {
        const p = await prisma.post.findUnique({
          where: { id: r.postId },
          select: { title: true, id: true, content: true },
        });
        if (p) target = { kind: "post", id: p.id, preview: p.title, href: `/p/${p.id}`, postContent: p.content };
      } else if (r.commentId) {
        const c = await prisma.comment.findUnique({ where: { id: r.commentId }, select: { content: true, id: true, postId: true } });
        if (c) target = { kind: "comment", id: c.id, preview: c.content.slice(0, 100), href: `/p/${c.postId}#c-${c.id}` };
      }
      return { ...r, target };
    })
  );

  const accent = community.themeColor || "var(--accent)";

  return (
    <AppShell username={session.user.name || ""} title="Mod Tools">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${accent}88, ${accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>Mod Tools</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>s/{community.slug}</p>
          </div>
          <Link
            href={`/c/${community.slug}`}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            <ArrowLeft size={13} /> Space
          </Link>
        </div>

        <div style={{ height: 1, background: "var(--border)", margin: "20px 0 28px" }} />

        {/* OPEN REPORTS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            <AlertCircle size={16} style={{ color: "var(--red)" }} />
            Open Reports
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>({reportRows.length})</span>
          </h2>
          {reportRows.length === 0 ? (
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              Clean queue — no open reports
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
              {reportRows.map((r) => (
                <li
                  key={r.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(239,68,68,0.12)",
                            color: "#fca5a5",
                            border: "1px solid rgba(239,68,68,0.25)",
                            fontWeight: 600,
                          }}
                        >
                          {r.target.kind}
                        </span>
                        <span>@{r.reporter.username}</span>
                        <span>·</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.target.preview}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        <span style={{ color: "var(--muted-2)" }}>Reason:</span> {r.reason}
                        {r.details && <span> — {r.details}</span>}
                      </p>
                    </div>
                    {r.target.href !== "#" && (
                      <Link
                        href={r.target.href}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "var(--accent)",
                          flexShrink: 0,
                        }}
                      >
                        view <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                  <ModActions
                    reportId={r.id}
                    targetType={r.target.kind}
                    targetId={r.target.id}
                    communityId={community.id}
                    postTitle={r.target.kind === "post" ? r.target.preview : undefined}
                    postContent={r.target.kind === "post" ? r.target.postContent : undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* MARKS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            <Tag size={16} style={{ color: "var(--accent)" }} />
            Marks
          </h2>
          <FlairManager communityId={community.id} />
        </section>

        {/* RECENTLY REMOVED POSTS */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recently Removed</h2>
          {removedPosts.length === 0 ? (
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              Nothing removed
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
              {removedPosts.map((p) => (
                <li
                  key={p.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link
                      href={`/p/${p.id}`}
                      style={{ fontWeight: 600, fontSize: 14, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {p.title}
                    </Link>
                    {p.removedReason && (
                      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Reason: {p.removedReason}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}>@{p.author.username}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* MOD LOG */}
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Mod Log</h2>
          {modActions.length === 0 ? (
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              No actions yet
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", padding: 0, margin: 0 }}>
              {modActions.map((a) => (
                <li
                  key={a.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: a.mod.accentColor || "var(--accent)" }}>@{a.mod.username}</span>
                    <span style={{ color: "var(--muted)" }}> · {a.action.replace(/_/g, " ")}</span>
                    <span style={{ color: "var(--muted-2)" }}> ({a.targetType})</span>
                    {a.reason && <span style={{ color: "var(--muted)", fontStyle: "italic" }}> — {a.reason}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--muted-2)", flexShrink: 0 }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </AppShell>
  );
}
