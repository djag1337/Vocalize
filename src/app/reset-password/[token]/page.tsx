"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Something went wrong"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
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

        {done ? (
          <div
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 20,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
            <p className="font-bold" style={{ fontSize: 18, color: "var(--foreground)", marginBottom: 10 }}>
              Password updated
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Redirecting you to login…
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24, textAlign: "center" }}>
              Choose a new password for your account.
            </p>
            <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
              <input
                className="input"
                type="password"
                placeholder="New password (min 6)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
              <input
                className="input"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              {err && <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>}
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full font-semibold transition-opacity"
                style={{
                  height: 48, background: "var(--accent)",
                  opacity: loading || !password || !confirm ? 0.5 : 1,
                  marginTop: 4, borderRadius: 9999, color: "#fff", fontSize: 15,
                }}
              >
                {loading ? "Updating…" : "Set new password"}
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
