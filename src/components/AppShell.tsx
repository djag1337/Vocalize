import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FONT_MAP: Record<string, { stack: string; url: string }> = {
  inter: {
    stack: "Inter, sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap",
  },
  geist: {
    stack: "Geist, sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;900&display=swap",
  },
  playfair: {
    stack: "'Playfair Display', serif",
    url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap",
  },
  "dm-sans": {
    stack: "'DM Sans', sans-serif",
    url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap",
  },
  mono: {
    stack: "'JetBrains Mono', monospace",
    url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  },
};

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
  let backgroundColor = "#0a0a0c";
  let cardColor = "#111113";
  let foregroundColor = "#f5f5f7";
  let mutedColor = "#8e8e93";
  let borderColor = "#ffffff";
  let sidebarColor = "#0d0d0d";
  let fontFamily = "inter";

  if (session?.user?.id) {
    const prefs = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accentColor: true,
        themeColor: true,
        backgroundColor: true,
        cardColor: true,
        foregroundColor: true,
        mutedColor: true,
        borderColor: true,
        sidebarColor: true,
        fontFamily: true,
      },
    });
    if (prefs) {
      accentColor = prefs.accentColor ?? "#ec4899";
      themeColor = prefs.themeColor ?? "#a855f7";
      backgroundColor = prefs.backgroundColor ?? "#0a0a0c";
      cardColor = prefs.cardColor ?? "#111113";
      foregroundColor = prefs.foregroundColor ?? "#f5f5f7";
      mutedColor = prefs.mutedColor ?? "#8e8e93";
      borderColor = prefs.borderColor ?? "#ffffff";
      sidebarColor = prefs.sidebarColor ?? "#0d0d0d";
      fontFamily = prefs.fontFamily ?? "inter";
    }
  }

  const font = FONT_MAP[fontFamily] ?? FONT_MAP.inter;

  return (
    <>
      {/* Override CSS vars at root level so all elements (including body) pick them up */}
      <style>{`
        :root {
          --background: ${backgroundColor};
          --font-body: ${font.stack};
          --card: ${cardColor};
          --foreground: ${foregroundColor};
          --muted: ${mutedColor};
          --border: ${borderColor}12;
          --border-2: ${borderColor}0d;
          --sidebar-bg: ${sidebarColor};
        }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={font.url} />
      <div
        className="flex min-h-screen"
        style={{
          background: "var(--background)",
          "--accent": accentColor,
          "--accent-2": themeColor,
        } as React.CSSProperties}
      >
        {/* Spacer holds the sidebar's width in the flow so content isn't hidden behind it */}
        <div className="hidden md:block shrink-0" style={{ width: 76 }} />
        <Sidebar username={username} />
        <div className="flex-1 flex flex-col items-center min-w-0">
          <div className="w-full" style={{ maxWidth: "42rem" }}>
            <TopBar title={title} />
            <main className="w-full app-main">{children}</main>
          </div>
        </div>
        <MobileNav />
      </div>
    </>
  );
}
