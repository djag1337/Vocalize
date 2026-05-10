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
    <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Welcome back</h1>
        <input className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 outline-none" placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 outline-none" placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold disabled:opacity-50">{loading ? "Signing in..." : "Log in"}</button>
        <p className="text-center text-sm text-gray-400">No account? <Link href="/register" className="text-purple-400 hover:underline">Sign up</Link></p>
      </form>
    </main>
  );
}
