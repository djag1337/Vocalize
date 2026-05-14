"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, House,
  Search, SearchCheck,
  PenSquare,
  Heart,
  User, UserCircle2,
} from "lucide-react";

const NAV = [
  { href: "/feed", Icon: Home, IconActive: House, label: "Home" },
  { href: "/search", Icon: Search, IconActive: SearchCheck, label: "Search" },
  { href: "/submit", Icon: PenSquare, IconActive: PenSquare, label: "Post" },
  { href: "/notifications", Icon: Heart, IconActive: Heart, label: "Activity" },
  { href: "/settings", Icon: User, IconActive: UserCircle2, label: "Profile" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 grid grid-cols-5 z-30"
      style={{ background: '#000000', borderTop: '1px solid var(--border)', height: 68 }}
    >
      {NAV.map(({ href, Icon, IconActive, label }) => {
        const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
        const I = active ? IconActive : Icon;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex items-center justify-center transition-colors"
            style={{ color: active ? 'var(--foreground)' : 'var(--nav-icon)' }}
          >
            <I size={24} strokeWidth={active ? 2.2 : 1.5} />
          </Link>
        );
      })}
    </nav>
  );
}
