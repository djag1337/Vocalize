import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import PostModal from "./PostModal";
import TopBar from "./TopBar";

export default function AppShell({
  username,
  title,
  children,
}: {
  username: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Spacer holds the sidebar's width in the flow so content isn't hidden behind it */}
      <div className="hidden md:block shrink-0" style={{ width: 76 }} />
      <Sidebar username={username} />
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="w-full" style={{ maxWidth: '42rem' }}>
          <TopBar title={title} />
          <main className="w-full app-main">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
      <PostModal />
    </div>
  );
}
