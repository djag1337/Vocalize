"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const res = await fetch("/api/register", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
    setLoading(false);
    if (!res.ok) { const data = await res.json(); setErr(data.error || "Failed"); return; }
    router.push("/login");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)", color: "var(--foreground)", position: "relative", overflow: "hidden" }}
    >
      <div style={{
        position: "absolute",
        top: "35%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div className="w-full" style={{ maxWidth: 384, position: "relative", zIndex: 1, padding: "0 24px" }}>
        <div className="text-center" style={{ marginBottom: 36 }}>
          <div className="inline-flex items-center justify-center font-black"
            style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, var(--accent-2), var(--accent))", marginBottom: 16, color: "#fff", fontSize: 28 }}>
            V
          </div>
          <h1 className="font-black" style={{ fontSize: 26, background: "linear-gradient(to right, var(--accent-2), var(--accent))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            Vocalize
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Join the conversation.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          <input className="input" placeholder="Password (min 6)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {err && <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>}
          <button type="submit" disabled={loading} className="w-full font-semibold transition-opacity"
            style={{ height: 48, background: "var(--accent)", opacity: loading ? 0.6 : 1, marginTop: 4, borderRadius: 9999, color: "#fff", fontSize: 15 }}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-center" style={{ fontSize: 13, color: "var(--muted)", marginTop: 24 }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--foreground)" }}>Log in</Link>
        </p>
      </div>
    </main>
  );
}
