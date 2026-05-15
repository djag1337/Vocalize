"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) { setErr("Invalid email or password"); return; }
    const next = searchParams.get("callbackUrl") || "/feed";
    router.push(next); router.refresh();
  }

  return (
    <>
      <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {err && <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold transition-opacity"
          style={{ height: 48, background: "var(--accent)", opacity: loading ? 0.6 : 1, marginTop: 4, borderRadius: 9999, color: "#fff", fontSize: 15 }}
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <div className="flex items-center justify-between" style={{ marginTop: 24 }}>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          No account?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--foreground)" }}>
            Sign up
          </Link>
        </p>
        <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}
          className="hover:underline">
          Forgot password?
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)", color: "var(--foreground)", position: "relative", overflow: "hidden" }}
    >
      {/* Background glow orb */}
      <div style={{
        position: "absolute",
        top: "35%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="w-full" style={{ maxWidth: 384, position: "relative", zIndex: 1 }}>
        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/logo.jpeg" alt="Vocalize" style={{ width: 80, height: 80, objectFit: "contain", mixBlendMode: "screen", marginBottom: 16, display: "block", margin: "0 auto 16px" }} />
          <h1 className="font-black" style={{
            fontSize: 26,
            background: "linear-gradient(to right, var(--accent-2), var(--accent))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}>
            Vocalize
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Real conversations. Real people.</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
