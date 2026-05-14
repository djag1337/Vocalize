import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:pl-[72px]">
      <Sidebar username={username} />
      <main className="mx-auto max-w-2xl border-x border-[var(--border)] min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
