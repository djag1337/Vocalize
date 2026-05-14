import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import SearchResults from "./SearchResults";
import SearchIdle from "./SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { q } = await searchParams;
  const query = (q || "").trim();

  return (
    <AppShell username={session.user.name || ""} title="Search">
      <div style={{ padding: "16px" }}>
        {/* Search bar */}
        <form method="GET" style={{ marginBottom: "4px" }}>
          <div
            className="bg-[var(--surface-3)] rounded-full"
            style={{
              display: "flex",
              alignItems: "center",
              height: "48px",
              padding: "0 16px",
              gap: "10px",
              border: "1px solid var(--border)",
            }}
          >
            {/* Search icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ minWidth: "18px", flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="Search posts, spaces, users..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "15px",
                color: "var(--foreground)",
                minWidth: 0,
              }}
            />
          </div>
        </form>

        {/* Content area */}
        {!query ? (
          <SearchIdle />
        ) : query.length < 2 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p className="text-[14px] text-[var(--muted)]">
              Type at least 2 characters to search
            </p>
          </div>
        ) : (
          <SearchResults query={query} />
        )}
      </div>
    </AppShell>
  );
}
