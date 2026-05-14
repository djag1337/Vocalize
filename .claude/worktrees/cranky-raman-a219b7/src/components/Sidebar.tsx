"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Home, House, Search, SearchCheck, Bell, BellRing,
  Bookmark, BookmarkCheck, Users, UsersRound,
  PenSquare, PenLine, Settings, Settings2,
  User, UserCircle2, LogOut, Flame, Newspaper,
  ChevronsLeft, ChevronsRight,
} from "lucide-react";

type NavItem = {
  href: string; label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  IconActive: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/feed", label: "Home", Icon: Home, IconActive: House },
  { href: "/search", label: "Search", Icon: Search, IconActive: SearchCheck },
  { href: "/notifications", label: "Notifications", Icon: Bell, IconActive: BellRing },
  { href: "/saved", label: "Saved", Icon: Bookmark, IconActive: BookmarkCheck },
  { href: "/c", label: "Communities", Icon: Users, IconActive: UsersRound },
  { href: "/submit", label: "Post", Icon: PenLine, IconActive: PenSquare },
  { href: "/settings", label: "Settings", Icon: Settings, IconActive: Settings2 },
];

type SidebarData = {
  trending: { id: string; slug: string; name: string; themeColor: string; _count: { members: number; posts: number } }[];
  recentPosts: { id: string; title: string; author: { username: string } }[];
};

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState<SidebarData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    fetch("/api/sidebar").then(r => r.json()).then(setData).catch(() => {});
  }, [pathname]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
  };

  // expose width as CSS var for layout
  const width = collapsed ? 72 : 260;

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-30 border-r border-[var(--border)] bg-[var(--background)] transition-[width] duration-200 ease-out"
      style={{ width: mounted ? width : 260 }}
    >
      {/* Header: logo + collapse */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 pt-4 pb-3`}>
        {!collapsed && (
          <Link href="/feed" className="px-2 text-xl font-bold tracking-tight text-white">
            Vocalize
          </Link>
        )}
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 rounded-xl hover:bg-[var(--surface)] text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      {/* Scrollable middle */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3">
        {/* Primary nav */}
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon, IconActive }) => {
            const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
            const I = active ? IconActive : Icon;
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`group flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-3"} py-2.5 rounded-xl text-[15px] transition ${
                  active ? "bg-[var(--surface-2)] text-white font-semibold" : "text-gray-300 hover:bg-[var(--surface)]"
                }`}
              >
                <I size={20} strokeWidth={active ? 2.4 : 1.8} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Trending Communities */}
        <div className="mt-5">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              <Flame size={12} strokeWidth={2.2} className="text-pink-400" />
              Trending
            </div>
          )}
          {collapsed && <div className="my-3 mx-auto w-6 border-t border-[var(--border)]" />}
          <ul className={`flex flex-col ${collapsed ? "gap-2 items-center" : "gap-0.5"}`}>
            {data?.trending.map(c => (
              <li key={c.id} className={collapsed ? "" : "w-full"}>
                <Link
                  href={`/c/${c.slug}`}
                  title={collapsed ? `c/${c.slug} · ${c._count.members} members` : undefined}
                  className={`flex items-center ${collapsed ? "justify-center w-9 h-9" : "gap-2.5 px-3 py-2"} rounded-xl hover:bg-[var(--surface)] transition`}
                >
                  <span
                    className="shrink-0 rounded-full"
                    style={{
                      width: collapsed ? 10 : 8,
                      height: collapsed ? 10 : 8,
                      background: c.themeColor || "#a78bfa",
                    }}
                  />
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] truncate text-gray-200">c/{c.slug}</div>
                      <div className="text-[10px] text-gray-500">{c._count.members} members</div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
            {!data && !collapsed && (
              <li className="text-xs text-gray-600 px-3 py-1">loading…</li>
            )}
          </ul>
        </div>

        {/* Recent Posts */}
        {!collapsed && (
          <div className="mt-5 mb-4">
            <div className="flex items-center gap-2 px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              <Newspaper size={12} strokeWidth={2.2} className="text-purple-400" />
              Recent
            </div>
            <ul className="flex flex-col gap-0.5">
              {data?.recentPosts.map(p => (
                <li key={p.id}>
                  <Link
                    href={`/p/${p.id}`}
                    className="block px-3 py-2 rounded-xl hover:bg-[var(--surface)] transition"
                  >
                    <div className="text-[12.5px] leading-snug line-clamp-2 text-gray-300">{p.title}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">@{p.author.username}</div>
                  </Link>
                </li>
              ))}
              {!data && <li className="text-xs text-gray-600 px-3 py-1">loading…</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom: profile + signout */}
      <div className="px-3 pt-2 pb-4 border-t border-[var(--border)] mt-2 flex flex-col gap-1">
        <Link
          href={`/u/${username}`}
          title={collapsed ? `@${username}` : undefined}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} py-2 rounded-xl hover:bg-[var(--surface)] text-sm ${
            pathname.startsWith(`/u/${username}`) ? "bg-[var(--surface-2)] text-white font-semibold" : "text-gray-300"
          }`}
        >
          {pathname.startsWith(`/u/${username}`)
            ? <UserCircle2 size={20} strokeWidth={2.4} />
            : <User size={20} strokeWidth={1.8} />}
          {!collapsed && <span className="truncate">@{username}</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={collapsed ? "Sign out" : undefined}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[var(--surface)] text-sm`}
        >
          <LogOut size={20} strokeWidth={1.8} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
