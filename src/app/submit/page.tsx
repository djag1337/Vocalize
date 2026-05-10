import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubmitForm from "./SubmitForm";
import Link from "next/link";
import { PenSquare } from "lucide-react";

export default async function SubmitPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");

 const communities = await prisma.community.findMany({
 select: { slug: true, name: true },
 orderBy: { name: "asc" },
 });

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <Link href="/feed" className="text-sm text-gray-400 hover:text-white">← back</Link>
 </div>
 </header>
 <div className="max-w-2xl mx-auto px-6 py-8">
 <div className="flex items-center gap-3 mb-2"><PenSquare size={28} strokeWidth={2} className="text-pink-400" /><h1 className="text-2xl font-bold mb-6">Create a post</h1></div>
 <SubmitForm communities={communities} />
 </div>
 </main>
 );
}
