import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AppShell({
  username,
  title,
  children,
}: {
  username: string;
  title?: string;
  children: React.ReactNode;
}) {
  const session = await auth();
  let accentColor = "#ec4899";
  let themeColor = "#a855f7";

  if (session?.user?.id) {
    const colors = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accentColor: true, themeColor: true },
    });
    if (colors) {
      accentColor = colors.accentColor;
      themeColor = colors.themeColor;
    }
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: 'var(--background)',
        "--accent": accentColor,
        "--accent-2": themeColor,
      } as React.CSSProperties}
    >
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
    </div>
  );
}
