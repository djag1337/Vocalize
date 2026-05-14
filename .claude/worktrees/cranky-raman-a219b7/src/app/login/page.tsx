"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) { setErr("Invalid email or password"); return; }
    router.push("/feed"); router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent)] bg-clip-text text-transparent">
            Vocalize
          </h1>
          <p className="text-[var(--muted)] text-[14px] mt-1.5">Real conversations. Real people.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
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
          {err && <p className="text-[var(--red)] text-[13px]">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-[13px] text-[var(--muted)] mt-6">
          No account?{" "}
          <Link href="/register" className="text-[var(--foreground)] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
