"use client";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type Props = {
  title?: string;
};

export default function TopBar({ title }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/feed";

  return (
    <header
      className="sticky top-0 z-40 flex items-center"
      style={{
        height: 56,
        background: "#000000",
        borderBottom: "1px solid var(--border)",
        padding: "0 8px",
      }}
    >
      {/* Left — back button or spacer */}
      <div style={{ width: 48, flexShrink: 0 }}>
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center transition-colors"
            style={{ width: 40, height: 40, borderRadius: 12, color: 'var(--foreground)' }}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Center — Vocalize mark + wordmark or page title */}
      <div className="flex-1 flex items-center justify-center" style={{ minWidth: 0 }}>
        {isHome || !title ? (
          <div className="flex items-center select-none" style={{ gap: 8 }}>
            <img src="/logo.jpeg" alt="Vocalize" style={{ width: 32, height: 32, objectFit: "contain", mixBlendMode: "screen" }} />
            <span
              className="font-black tracking-tight"
              style={{
                fontSize: 18,
                background: 'linear-gradient(to right, var(--accent-2), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Vocalize
            </span>
          </div>
        ) : (
          <span className="font-bold truncate" style={{ fontSize: 17, color: 'var(--foreground)' }}>
            {title}
          </span>
        )}
      </div>

      {/* Right — spacer to keep title centered */}
      <div style={{ width: 48, flexShrink: 0 }} />
    </header>
  );
}
