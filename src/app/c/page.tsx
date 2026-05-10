import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { posts: true, members: true } } },
  });

  return (
    <AppShell username={session.user.name || ""}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-[15px]">Communities</h1>
        <Link href="/c/new" className="pill pill-primary text-xs">
          + New
        </Link>
      </header>

      <div className="px-4 py-4">
        {communities.length === 0 ? (
          <div className="surface p-8 text-center mt-4">
            <p className="text-[var(--muted)] text-[14px]">no communities yet</p>
            <Link href="/c/new" className="inline-block mt-3 text-[var(--accent)] hover:underline text-[13px]">
              create the first one →
            </Link>
          </div>
        ) : (
          <div>
            {communities.map(c => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="block border-b border-[var(--border)] py-4 hover:bg-[var(--surface)]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px]" style={{ color: c.themeColor || "var(--accent)" }}>
                        c/{c.slug}
                      </span>
                      <span className="text-[var(--muted)] text-[13px] truncate">{c.name}</span>
                    </div>
                    {c.description && (
                      <p className="text-[13px] text-[var(--muted)] mt-1 clamp-2">{c.description}</p>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--muted-2)] text-right shrink-0">
                    <div>{c._count.posts} posts</div>
                    <div>{c._count.members} members</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
