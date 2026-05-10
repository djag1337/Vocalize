import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import NewCommunityForm from "./NewCommunityForm";

export default async function NewCommunityPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <Link href="/c" className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs">← Communities</Link>
 </div>
 </header>

 <div className="max-w-2xl mx-auto px-6 py-6">
 <div className="flex items-center gap-3 mb-2"><Plus size={28} strokeWidth={2} className="text-pink-400" /><h1 className="text-3xl font-bold mb-6">Create a community</h1></div>
 <NewCommunityForm />
 </div>
 </main>
 );
}
