import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");

 const user = await prisma.user.findUnique({
 where: { id: session.user.id },
 select: {
   username: true,
   displayName: true,
   bio: true,
   avatarUrl: true,
   bannerUrl: true,
   themeColor: true,
   accentColor: true,
   feedDensity: true,
   displayBadgeId: true,
   nowPlaying: true,
   badges: {
     include: {
       badge: {
         select: { id: true, slug: true, name: true, icon: true, color: true },
       },
     },
   },
 },
 });
 if (!user) redirect("/login");

 return (
 <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
 <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
 <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
 <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
 <Link href={`/u/${user.username}`} className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 text-xs">View profile →</Link>
 </div>
 </header>

 <div className="max-w-2xl mx-auto px-6 py-8">
 <div className="flex items-center gap-3 mb-2"><SettingsIcon size={28} strokeWidth={2} className="text-pink-400" /><h1 className="text-3xl font-bold mb-2">Settings</h1></div>
 <p className="text-gray-400 mb-6">make it yours </p>
 <SettingsForm initial={user} />
 </div>
 </main>
 );
}
