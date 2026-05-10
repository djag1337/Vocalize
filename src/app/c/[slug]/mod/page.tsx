import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Shield, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import ModActions from "./ModActions";

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
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <Shield size={48} className="text-gray-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Mods only</h1>
          <p className="text-gray-400 mb-6">You don&apos;t have permission to view this page.</p>
          <Link href={`/c/${slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10">
            <ArrowLeft size={16} /> Back to c/{slug}
          </Link>
        </div>
      </main>
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
      let target: { kind: "post" | "comment" | "unknown"; id: string; preview: string; href: string } = {
        kind: "unknown", id: "", preview: "(deleted)", href: "#",
      };
      if (r.postId) {
        const p = await prisma.post.findUnique({ where: { id: r.postId }, select: { title: true, id: true } });
        if (p) target = { kind: "post", id: p.id, preview: p.title, href: `/p/${p.id}` };
      } else if (r.commentId) {
        const c = await prisma.comment.findUnique({ where: { id: r.commentId }, select: { content: true, id: true, postId: true } });
        if (c) target = { kind: "comment", id: c.id, preview: c.content.slice(0, 100), href: `/p/${c.postId}#c-${c.id}` };
      }
      return { ...r, target };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
      <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
          <Link href={`/c/${community.slug}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs">
            <ArrowLeft size={14} /> c/{community.slug}
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Shield size={28} strokeWidth={2} className="text-pink-400" />
          <h1 className="text-2xl font-bold">Mod Tools</h1>
        </div>
        <p className="text-gray-400 mb-8">c/{community.slug} — {community.name}</p>

        {/* OPEN REPORTS */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <AlertCircle size={18} className="text-pink-400" />
            Open Reports <span className="text-sm text-gray-400 font-normal">({reportRows.length})</span>
          </h2>
          {reportRows.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400">
              No open reports — clean queue
            </div>
          ) : (
            <ul className="space-y-3">
              {reportRows.map((r) => (
                <li key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">{r.target.kind}</span>
                        <span>reported by @{r.reporter.username}</span>
                        <span>·</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-medium truncate">{r.target.preview}</p>
                      <p className="text-sm text-gray-300 mt-1">
                        <span className="text-gray-500">Reason:</span> {r.reason}
                        {r.details && <span className="text-gray-400"> — {r.details}</span>}
                      </p>
                    </div>
                    {r.target.href !== "#" && (
                      <Link href={r.target.href} className="text-xs text-pink-400 hover:underline inline-flex items-center gap-1 shrink-0">
                        view <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                  <ModActions
                    reportId={r.id}
                    targetType={r.target.kind}
                    targetId={r.target.id}
                    communityId={community.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RECENT REMOVED POSTS */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Recently Removed Posts</h2>
          {removedPosts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400">
              Nothing removed
            </div>
          ) : (
            <ul className="space-y-2">
              {removedPosts.map((p) => (
                <li key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <Link href={`/p/${p.id}`} className="font-medium hover:underline truncate">{p.title}</Link>
                    <span className="text-xs text-gray-500 shrink-0">@{p.author.username}</span>
                  </div>
                  {p.removedReason && <p className="text-xs text-gray-400 mt-1">Reason: {p.removedReason}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* MOD LOG */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Mod Log</h2>
          {modActions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400">
              No actions yet
            </div>
          ) : (
            <ul className="space-y-1">
              {modActions.map((a) => (
                <li key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold" style={{ color: a.mod.accentColor || "#ec4899" }}>@{a.mod.username}</span>
                    <span className="text-gray-300"> · {a.action.replace("_", " ")}</span>
                    <span className="text-gray-500"> ({a.targetType})</span>
                    {a.reason && <span className="text-gray-400 italic"> — {a.reason}</span>}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
