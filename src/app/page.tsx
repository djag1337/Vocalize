import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vocalize — Nobody silences you here.",
  description:
    "Feeling silenced everywhere else? Here you can Vocalize that. No shadow bans. No algorithm deciding what matters. Just people talking.",
  openGraph: {
    title: "Vocalize — Nobody silences you here.",
    description:
      "No shadow bans. No algorithm deciding what matters. Just people talking.",
    url: "https://vocalize.app",
    siteName: "Vocalize",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocalize — Nobody silences you here.",
    description: "No shadow bans. No algorithm deciding what matters. Just people talking.",
  },
};

export default function Home() {
  return (
    <main style={{ background: "#0c0c0e", minHeight: "100vh", color: "#f5f4fa" }}>

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#f5f4fa" }}>
          <img src="/logo.jpeg" alt="Vocalize" style={{ width: 36, height: 36, objectFit: "contain", mixBlendMode: "screen" }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>Vocalize</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/login" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
            Log in
          </Link>
          <Link
            href="/register"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#a855f7",
              padding: "9px 20px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Join free
          </Link>
        </div>
      </nav>

      {/* Hero — manifesto */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "100px 40px 80px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a855f7", marginBottom: 28 }}>
          Vocalize
        </p>
        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-3px",
            color: "#f5f4fa",
            margin: "0 0 40px",
          }}
        >
          Nobody silences<br />
          you here.
        </h1>
        <div style={{ maxWidth: 560, borderLeft: "2px solid #a855f7", paddingLeft: 24, marginBottom: 52 }}>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            Every other platform built a list of what you can&apos;t say.
            Rules that keep changing. Moderation that never explains itself.
            Bans with no reason. Posts that disappear quietly.
            <br /><br />
            Vocalize is what the internet was supposed to be.
            Say what you mean. Find people who get it.
          </p>
        </div>
        <Link
          href="/register"
          style={{
            display: "inline-block",
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            background: "#a855f7",
            padding: "14px 32px",
            borderRadius: 999,
            textDecoration: "none",
            letterSpacing: "-0.2px",
          }}
        >
          Start talking →
        </Link>
      </section>

      {/* Pull statement */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "52px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontSize: "clamp(20px, 3.5vw, 32px)",
              fontWeight: 800,
              letterSpacing: "-1px",
              lineHeight: 1.2,
              color: "#f5f4fa",
              margin: 0,
              maxWidth: 520,
            }}
          >
            &ldquo;Feeling silenced everywhere else?
            Here you can Vocalize that.&rdquo;
          </p>
          <Link
            href="/feed"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#a855f7",
              textDecoration: "none",
              whiteSpace: "nowrap",
              borderBottom: "1px solid rgba(168,85,247,0.4)",
              paddingBottom: 2,
            }}
          >
            See what people are saying →
          </Link>
        </div>
      </div>

      {/* What it actually is */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "80px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "start",
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            How it works
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[
              { label: "Spaces", desc: "Community-run rooms for any topic. No algorithm picks what you see — members do." },
              { label: "Marks", desc: "Tag your posts with what they actually are. Keep things organized without gatekeeping." },
              { label: "Real moderation", desc: "When something gets removed, there's a reason. Mods are humans, not bots." },
            ].map(({ label, desc }) => (
              <div key={label}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#f5f4fa", margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.15)",
            borderRadius: 20,
            padding: "36px 32px",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            Spaces you can join today
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { slug: "general", name: "General", color: "#a855f7", desc: "The open floor" },
              { slug: "tech", name: "Tech", color: "#3b82f6", desc: "Software, hardware, the internet" },
              { slug: "music", name: "Music", color: "#ec4899", desc: "Tracks, artists, shows" },
              { slug: "art", name: "Art", color: "#f59e0b", desc: "Visual art & design" },
              { slug: "gaming", name: "Gaming", color: "#10b981", desc: "Games and the culture" },
            ].map(({ slug, name, color, desc }) => (
              <Link
                key={slug}
                href={`/c/${slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f4fa", minWidth: 60 }}>s/{name}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{desc}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/register"
            style={{
              display: "block",
              marginTop: 24,
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#a855f7",
              padding: "11px 0",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Join and start posting
          </Link>
        </div>
      </section>

      {/* Bottom */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          Vocalize — by the people, for the people.
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/tos" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Privacy</Link>
          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Log in</Link>
          <Link href="/register" style={{ fontSize: 13, color: "#a855f7", textDecoration: "none", fontWeight: 600 }}>Create account</Link>
        </div>
      </div>

    </main>
  );
}
