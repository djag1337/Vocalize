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
    <div className="min-h-screen flex justify-center">
      <Sidebar username={username} />
      <main className="flex-1 max-w-[720px] border-x border-[var(--border)] min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
