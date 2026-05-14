"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, House,
  Search, SearchCheck,
  PenLine, PenSquare,
  Bell, BellRing,
  Settings, Settings2,
} from "lucide-react";

const NAV = [
  { href: "/feed", Icon: Home, IconActive: House, label: "Home" },
  { href: "/search", Icon: Search, IconActive: SearchCheck, label: "Search" },
  { href: "/submit", Icon: PenLine, IconActive: PenSquare, label: "Post" },
  { href: "/notifications", Icon: Bell, IconActive: BellRing, label: "Alerts" },
  { href: "/settings", Icon: Settings, IconActive: Settings2, label: "Settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--background)]/95 backdrop-blur border-t border-[var(--border)] flex justify-around py-2 z-30">
      {NAV.map(({ href, Icon, IconActive, label }) => {
        const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
        const I = active ? IconActive : Icon;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex-1 flex flex-col items-center py-1.5 transition ${active ? "text-white" : "text-gray-500"}`}
          >
            <I size={22} strokeWidth={active ? 2.4 : 1.8} />
          </Link>
        );
      })}
    </nav>
  );
}
