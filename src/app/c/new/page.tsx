import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewCommunityForm from "./NewCommunityForm";
import AppShell from "@/components/AppShell";

export default async function NewCommunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AppShell username={session.user.name || ""} title="New Space">
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
        <NewCommunityForm />
      </div>
    </AppShell>
  );
}
