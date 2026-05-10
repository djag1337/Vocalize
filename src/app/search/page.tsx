import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import SearchResults from "./SearchResults";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { q } = await searchParams;
  const query = (q || "").trim();

  return (
    <AppShell username={session.user.name || ""}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3">
        <form>
          <input
            type="text"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search posts, communities, users..."
            className="input text-[15px]"
          />
        </form>
      </header>

      <div className="px-4 py-4">
        {query.length < 2 ? (
          <div className="p-8 text-center">
            <p className="text-[var(--muted)] text-[14px]">Type at least 2 characters to search</p>
          </div>
        ) : (
          <SearchResults query={query} />
        )}
      </div>
    </AppShell>
  );
}
