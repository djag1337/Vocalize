import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

const DEMO_SPACES = [
  { slug: "indie-rock",        name: "Indie Rock",        members: "2.4k", posts: 841,  description: "Guitar-driven anthems, lo-fi dreams, and bedroom recordings that hit hard.", accent: "#E85D4A" },
  { slug: "lo-fi-chill",       name: "Lo-Fi & Chill",     members: "5.1k", posts: 2103, description: "Beats to study, sleep, and drift to. No drops, just vibes.", accent: "#6C63FF" },
  { slug: "vinyl-heads",       name: "Vinyl Heads",       members: "1.8k", posts: 519,  description: "Crackle and warmth. Share your latest hauls, setups, and sleeve art.", accent: "#F5A623" },
  { slug: "concert-clips",     name: "Concert Clips",     members: "3.7k", posts: 1240, description: "You were there. Show us the moment — vertical blur and all.", accent: "#00BA7C" },
  { slug: "music-production",  name: "Music Production",  members: "4.2k", posts: 988,  description: "DAWs, plugins, mixing tips, and feedback on your tracks.", accent: "#1DA1F2" },
  { slug: "new-releases",      name: "New Releases",      members: "9.3k", posts: 3872, description: "Everything dropping this week. Reviews, hot takes, and first listens.", accent: "#FF6B9D" },
  { slug: "artist-spotlights", name: "Artist Spotlights", members: "2.0k", posts: 674,  description: "Shine a light on artists you think deserve more ears.", accent: "#FFB347" },
  { slug: "deep-cuts",         name: "Deep Cuts",         members: "1.3k", posts: 421,  description: "Obscure B-sides, forgotten albums, and tracks only you seem to know.", accent: "#9B59B6" },
];

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default async function SpacesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const spaces = await prisma.community.findMany({
    orderBy: { members: { _count: "desc" } },
    take: 100,
    include: { _count: { select: { posts: true, members: true } } },
  });

  const isEmpty = spaces.length === 0;

  return (
    <AppShell username={session.user.name || ""} title="Spaces">
      <div style={{ padding: "16px 16px 40px" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between" style={{ marginBottom: 24, gap: 12 }}>
          <div>
            <h2 className="font-bold" style={{ fontSize: 22, lineHeight: "1.2", color: "var(--foreground)" }}>
              {isEmpty ? "Discover Spaces" : "All Spaces"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
              {isEmpty
                ? "Places to gather, talk, and make your voice heard."
                : `${spaces.length} space${spaces.length !== 1 ? "s" : ""} and counting`}
            </p>
          </div>
          <Link
            href="/c/new"
            className="font-semibold shrink-0"
            style={{ background: "var(--accent)", padding: "10px 20px", fontSize: 14, borderRadius: 9999, color: "#fff" }}
          >
            + Create space
          </Link>
        </div>

        {isEmpty ? (
          <>
            {/* Empty state hero */}
            <div
              className="text-center"
              style={{
                background: "var(--surface-3)",
                borderRadius: 28,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                padding: "40px 28px 36px",
                marginBottom: 28,
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 14 }}>🌐</div>
              <p className="font-bold" style={{ fontSize: 19, marginBottom: 8, color: "var(--foreground)" }}>
                No spaces yet
              </p>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: "1.55", maxWidth: 300, margin: "0 auto 24px" }}>
                Be the one who starts something. Create a space and invite people who share your taste.
              </p>
              <Link
                href="/c/new"
                className="inline-block font-semibold"
                style={{ background: "var(--accent)", padding: "11px 32px", fontSize: 15, borderRadius: 9999, color: "#fff" }}
              >
                Create a space
              </Link>
            </div>

            {/* Section label */}
            <p
              className="font-semibold"
              style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}
            >
              Popular on Vocalize
            </p>

            {/* Demo space cards */}
            <div className="flex flex-col" style={{ gap: 10 }}>
              {DEMO_SPACES.map(s => (
                <div
                  key={s.slug}
                  className="flex items-center"
                  style={{
                    background: "var(--surface-3)",
                    borderRadius: 24,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    padding: "14px 18px",
                    gap: 14,
                  }}
                >
                  <div
                    className="flex items-center justify-center font-bold shrink-0"
                    style={{
                      width: 48, height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${s.accent}88, ${s.accent})`,
                      fontSize: 18,
                      color: "#fff",
                    }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate" style={{ fontSize: 15, color: "var(--foreground)" }}>
                      {s.name}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 1 }}>s/{s.slug}</div>
                    <div
                      style={{
                        color: "var(--muted)", fontSize: 13, marginTop: 5, lineHeight: "1.4",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}
                    >
                      {s.description}
                    </div>
                  </div>
                  <div className="shrink-0 text-right" style={{ minWidth: 52 }}>
                    <div className="font-semibold" style={{ fontSize: 14, color: "var(--foreground)" }}>{s.members}</div>
                    <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 1 }}>members</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {spaces.map(s => {
              const accent = s.themeColor || "var(--accent)";
              return (
                <Link
                  key={s.id}
                  href={`/c/${s.slug}`}
                  className="group flex items-center transition-all"
                  style={{
                    background: "var(--surface-3)",
                    borderRadius: 24,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    padding: "14px 18px",
                    gap: 14,
                  }}
                >
                  {/* Gradient avatar */}
                  <div
                    className="flex items-center justify-center font-bold shrink-0"
                    style={{
                      width: 52, height: 52,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${accent}88, ${accent})`,
                      fontSize: 20,
                      color: "#fff",
                    }}
                  >
                    {s.name[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate" style={{ fontSize: 16, color: "var(--foreground)" }}>
                      {s.name}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>s/{s.slug}</div>
                    {s.description && (
                      <div
                        style={{
                          color: "var(--muted)", fontSize: 13, marginTop: 5, lineHeight: "1.45",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                      >
                        {s.description}
                      </div>
                    )}
                    {/* Stats */}
                    <div className="flex items-center" style={{ gap: 8, marginTop: 8 }}>
                      <span
                        className="font-medium"
                        style={{
                          background: `${accent}22`,
                          color: accent,
                          padding: "3px 10px",
                          fontSize: 12,
                          borderRadius: 9999,
                        }}
                      >
                        {fmt(s._count.members)} members
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        {fmt(s._count.posts)} posts
                      </span>
                    </div>
                  </div>

                  {/* Arrow button */}
                  <div
                    className="shrink-0 flex items-center justify-center transition-transform group-hover:translate-x-0.5"
                    style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: `${accent}22`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
