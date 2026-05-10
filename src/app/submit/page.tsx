import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubmitForm from "./SubmitForm";
import Link from "next/link";
import AppShell from "@/components/AppShell";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const communities = await prisma.community.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell username={session.user.name || ""}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ←
        </Link>
        <span className="font-semibold text-[15px]">Create post</span>
      </header>

      <div className="px-4 py-6">
        <SubmitForm communities={communities} />
      </div>
    </AppShell>
  );
}
