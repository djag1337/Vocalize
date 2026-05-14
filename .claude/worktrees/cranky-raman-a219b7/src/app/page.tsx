import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Vocalize
        </h1>
        <p className="text-xl text-gray-300">Real conversations. Real people. Zero AI moderation.</p>
        <p className="text-gray-400">Threads-style feed. Reddit-style power. Yours to customize.</p>
        <div className="flex gap-4 justify-center pt-6">
          <Link href="/register" className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition font-semibold">Join</Link>
          <Link href="/login" className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition font-semibold">Log in</Link>
        </div>
      </div>
    </main>
  );
}
