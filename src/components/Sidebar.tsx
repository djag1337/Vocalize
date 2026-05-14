"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, House, Search, SearchCheck,
  Bookmark, BookmarkCheck, Users, UsersRound,
  PenSquare, Heart, Settings, Settings2,
} from "lucide-react";

type NavItem = {
  href: string; label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  IconActive: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const NAV: NavItem[] = [
  { href: "/feed",          label: "The Floor",     Icon: Home,      IconActive: House },
  { href: "/search",        label: "Search",        Icon: Search,    IconActive: SearchCheck },
  { href: "/submit",        label: "Post",          Icon: PenSquare, IconActive: PenSquare },
  { href: "/notifications", label: "Notifications", Icon: Heart,     IconActive: Heart },
  { href: "/saved",         label: "Saved",         Icon: Bookmark,  IconActive: BookmarkCheck },
  { href: "/c",             label: "Spaces",        Icon: Users,     IconActive: UsersRound },
];

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col items-center fixed left-0 top-0 z-30"
      style={{ height: '100vh', width: 76, background: '#000000', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div style={{ paddingTop: 28, paddingBottom: 20 }}>
        <Link
          href="/feed"
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ width: 44, height: 44 }}
        >
          <img src="/logo.jpeg" alt="Vocalize" style={{ width: 44, height: 44, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center justify-center flex-1" style={{ gap: 4 }}>
        {NAV.map(({ href, label, Icon, IconActive }) => {
          const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
          const I = active ? IconActive : Icon;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="flex items-center justify-center transition-all"
              style={{
                width: 44, height: 44, borderRadius: 12,
                color: active ? 'var(--foreground)' : '#B8B8B8',
              }}
            >
              <I size={26} strokeWidth={active ? 2.2 : 1.5} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom — profile + settings */}
      <div className="flex flex-col items-center" style={{ gap: 4, paddingBottom: 24 }}>
        <Link
          href="/settings"
          title="Settings"
          className="flex items-center justify-center transition-all"
          style={{
            width: 44, height: 44, borderRadius: 12,
            color: pathname === "/settings" ? 'var(--foreground)' : '#B8B8B8',
          }}
        >
          {pathname === "/settings"
            ? <Settings2 size={26} strokeWidth={2.2} />
            : <Settings size={26} strokeWidth={1.5} />}
        </Link>
        <Link
          href={`/u/${username}`}
          title={`@${username}`}
          className="flex items-center justify-center transition-all"
          style={{ width: 44, height: 44 }}
        >
          <div
            className="flex items-center justify-center font-bold"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(to bottom right, var(--accent-2), var(--accent))',
              color: 'white', fontSize: 13,
              boxShadow: pathname.startsWith(`/u/${username}`) ? '0 0 0 2px var(--foreground)' : undefined,
            }}
          >
            {username[0]?.toUpperCase() || "?"}
          </div>
        </Link>
      </div>
    </aside>
  );
}
