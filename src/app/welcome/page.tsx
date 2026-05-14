"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Space = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  themeColor: string | null;
  _count: { members: number; posts: number };
};

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function WelcomePage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    fetch("/api/communities")
      .then(r => r.json())
      .then(data => {
        setSpaces(Array.isArray(data) ? data : data.communities ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggleJoin(slug: string) {
    setJoining(slug);
    try {
      await fetch(`/api/communities/${slug}/join`, { method: "POST" });
      setJoined(prev => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        return next;
      });
    } finally {
      setJoining(null);
    }
  }

  async function goToFeed() {
    setContinuing(true);
    router.push("/feed");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c0c0e",
        color: "#f5f4fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 24px 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 480,
          paddingTop: 72,
          paddingBottom: 48,
        }}
      >
        {/* Logo mark */}
        <img src="/logo.jpeg" alt="Vocalize" style={{ width: 88, height: 88, objectFit: "contain", mixBlendMode: "screen", marginBottom: 28 }} />

        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            margin: "0 0 16px",
            color: "#f5f4fa",
          }}
        >
          You&apos;re in.
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}
        >
          Join a few spaces to shape your feed. Or skip and explore on your own — it&apos;s your call.
        </p>
      </div>

      {/* Spaces list */}
      <div style={{ width: "100%", maxWidth: 520 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14, paddingTop: 32 }}>
            Loading spaces…
          </div>
        ) : spaces.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14, paddingTop: 32 }}>
            No spaces yet —{" "}
            <Link href="/c/new" style={{ color: "#a855f7", textDecoration: "none" }}>
              be the first to create one
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {spaces.map(s => {
              const accent = s.themeColor || "#a855f7";
              const isJoined = joined.has(s.slug);
              const isBusy = joining === s.slug;

              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: isJoined
                      ? `rgba(${hexToRgb(accent)}, 0.06)`
                      : "rgba(255,255,255,0.03)",
                    border: isJoined
                      ? `1px solid rgba(${hexToRgb(accent)}, 0.25)`
                      : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20,
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${accent}88, ${accent})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {s.name[0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f5f4fa" }}>
                      {s.name}
                    </div>
                    {s.description && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 2,
                          lineHeight: 1.4,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {s.description}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                      {fmt(s._count.members)} members · {fmt(s._count.posts)} posts
                    </div>
                  </div>

                  {/* Join button */}
                  <button
                    onClick={() => toggleJoin(s.slug)}
                    disabled={isBusy}
                    style={{
                      flexShrink: 0,
                      height: 34,
                      padding: "0 18px",
                      borderRadius: 9999,
                      border: isJoined ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.2)",
                      background: isJoined ? `${accent}22` : "transparent",
                      color: isJoined ? accent : "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isBusy ? "wait" : "pointer",
                      opacity: isBusy ? 0.6 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {isBusy ? "…" : isJoined ? "Joined ✓" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={goToFeed}
            disabled={continuing}
            style={{
              flex: 1,
              minWidth: 180,
              height: 52,
              borderRadius: 9999,
              border: "none",
              background: "#a855f7",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: continuing ? "wait" : "pointer",
              opacity: continuing ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {continuing ? "Going…" : joined.size > 0 ? `Go to my feed →` : "Go to feed →"}
          </button>
          <Link
            href="/c/new"
            style={{
              height: 52,
              padding: "0 24px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            + Create a space
          </Link>
        </div>
      </div>
    </main>
  );
}

// helper — converts hex to "r, g, b" string for rgba()
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
