import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import SearchResults from "./SearchResults";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const { q } = await searchParams;
 const query = (q || "").trim();

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <Link href="/feed" className="text-sm text-gray-300 hover:text-white">← Feed</Link>
 </div>
 </header>

 <div className="max-w-2xl mx-auto px-6 py-6">
 <div className="flex items-center gap-3 mb-2"><SearchIcon size={28} strokeWidth={2} className="text-pink-400" /><h1 className="text-2xl font-bold mb-1">Search</h1></div>
 <p className="text-gray-400 text-sm mb-6">Posts, communities, users — all human-curated</p>

 <form className="mb-6">
 <input
 type="text"
 name="q"
 defaultValue={query}
 autoFocus
 placeholder="search anything..."
 className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-pink-400 focus:outline-none placeholder-gray-500"
 />
 </form>

 {query.length < 2 ? (
 <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
 <p className="text-gray-300">type at least 2 characters </p>
 </div>
 ) : (
 <SearchResults query={query} />
 )}
 </div>
 </main>
 );
}
