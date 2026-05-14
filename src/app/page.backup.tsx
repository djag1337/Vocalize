// BACKUP — landing page v1 (icon cards version)
// To restore: copy this file to page.tsx
// Or: git checkout HEAD -- src/app/page.tsx

import Link from "next/link";
import { EyeOff, Users, Radio } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col" style={{ background: "#0c0c0e", minHeight: "100vh", color: "#f5f4fa" }}>

      {/* Nav */}
      <nav
        className="flex items-center"
        style={{
          justifyContent: "space-between",
          padding: "18px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" className="flex items-center" style={{ gap: 10, textDecoration: "none", color: "#f5f4fa" }}>
          <svg width="28" height="34" viewBox="0 0 36 44" fill="none">
            <path
              d="M24 10C24 5 18 3 12 6C6 9 5 15 8 20C10 23 15 25 19 27L9 37C7 39 8 43 12 43C16 43 18.5 41 21 39L33 27"
              stroke="#a855f7"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.3px" }}>Vocalize</span>
        </Link>
        <div className="flex items-center" style={{ gap: 20 }}>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Log in</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 600, color: "#f5f4fa", background: "#a855f7", padding: "9px 20px", borderRadius: 999, textDecoration: "none" }}>Join free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto", padding: "96px 24px 72px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.28)", color: "#a855f7", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 999, marginBottom: 32 }}>
          Freedom of speech. For real.
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.08, margin: "0 0 24px", color: "#f5f4fa" }}>
          Feeling silenced everywhere else?
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: "0 0 44px", maxWidth: 520 }}>
          Here you can Vocalize that. No shadow bans. No algorithm deciding what matters. Just people talking.
        </p>
        <div className="flex items-center" style={{ gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/register" style={{ fontSize: 15, fontWeight: 700, color: "#f5f4fa", background: "#a855f7", padding: "13px 28px", borderRadius: 999, textDecoration: "none" }}>Join the movement →</Link>
          <Link href="/c" style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.18)", padding: "13px 28px", borderRadius: 999, textDecoration: "none" }}>Explore spaces</Link>
        </div>
      </section>

      {/* Stat strip */}
      <div className="flex items-center" style={{ justifyContent: "center", gap: 56, padding: "32px 40px", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
        {[{ value: "5", label: "spaces live" }, { value: "0%", label: "AI moderation" }, { value: "You", label: "are the platform" }].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#a855f7", letterSpacing: "-1px" }}>{value}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="flex items-center" style={{ justifyContent: "center", padding: "72px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 860, width: "100%" }}>
          {[{ Icon: EyeOff, title: "No shadow bans", body: "If your post is removed, you'll know. No silent suppression, ever." }, { Icon: Users, title: "People, not algorithms", body: "Every space is governed by real humans. Your feed, your rules." }, { Icon: Radio, title: "Build your space", body: "Create a community, set the tone, grow the audience you deserve." }].map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "32px 28px", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(168,85,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color="#a855f7" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#f5f4fa" }}>{title}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="flex flex-col items-center" style={{ textAlign: "center", padding: "72px 24px 96px", borderTop: "1px solid rgba(255,255,255,0.07)", gap: 12 }}>
        <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", margin: 0, color: "#f5f4fa" }}>Your voice belongs somewhere.</p>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", margin: "0 0 36px" }}>That place is here.</p>
        <Link href="/register" style={{ fontSize: 15, fontWeight: 700, color: "#f5f4fa", background: "#a855f7", padding: "14px 32px", borderRadius: 999, textDecoration: "none" }}>Create your account</Link>
      </section>
    </main>
  );
}
