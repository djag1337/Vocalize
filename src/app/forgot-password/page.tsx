"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Something went wrong"); return; }
      setSent(true);
    } catch {
      setErr("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)", color: "var(--foreground)", position: "relative", overflow: "hidden" }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="w-full" style={{ maxWidth: 384, position: "relative", zIndex: 1, padding: "0 24px" }}>

        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 36 }}>
          <img src="/logo.jpeg" alt="Vocalize" style={{ width: 80, height: 80, objectFit: "contain", mixBlendMode: "screen", marginBottom: 16 }} />
          <h1 className="font-black" style={{
            fontSize: 26,
            background: "linear-gradient(to right, var(--accent-2), var(--accent))",
            WebkitBackgroundClip: "text", backgroundClip: "text",
            color: "transparent", WebkitTextFillColor: "transparent",
          }}>
            Vocalize
          </h1>
        </div>

        {sent ? (
          /* Success state */
          <div
            style={{
              background: "rgba(168,85,247,0.06)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 20,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>📬</div>
            <p className="font-bold" style={{ fontSize: 18, color: "var(--foreground)", marginBottom: 10 }}>
              Check your inbox
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>
              If an account exists for <strong style={{ color: "var(--foreground)" }}>{email}</strong>, we&apos;ve sent a reset link. It expires in 1 hour.
            </p>
            <Link
              href="/login"
              style={{
                display: "block", textAlign: "center", fontSize: 14,
                color: "var(--accent)", textDecoration: "none",
              }}
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24, textAlign: "center", lineHeight: 1.5 }}>
              Enter the email on your account and we&apos;ll send a reset link.
            </p>
            <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              {err && <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full font-semibold transition-opacity"
                style={{
                  height: 48, background: "var(--accent)",
                  opacity: loading || !email ? 0.5 : 1,
                  marginTop: 4, borderRadius: 9999, color: "#fff", fontSize: 15,
                }}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="text-center" style={{ fontSize: 13, color: "var(--muted)", marginTop: 24 }}>
              <Link href="/login" className="hover:underline" style={{ color: "var(--foreground)" }}>
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
