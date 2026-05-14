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
    select: { id: true, slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell username={session.user.name || ""} title="New Post">
      <div style={{ padding: "24px 16px", maxWidth: 680, margin: "0 auto" }}>
        <SubmitForm communities={communities} />
      </div>
    </AppShell>
  );
}
