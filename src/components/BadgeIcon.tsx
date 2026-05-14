"use client";
import { useState, useRef, useEffect } from "react";

type Props = {
  icon: string;
  name: string;
  color: string;
  rarity?: string | null;
};

export default function BadgeIcon({ icon, name, color, rarity }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="text-[18px] leading-none transition-transform hover:scale-125 active:scale-110"
        title={name}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 1px" }}
      >
        {icon}
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 rounded-[14px] shadow-xl border border-[var(--border)] whitespace-nowrap"
          style={{ background: "var(--card)", padding: "10px 14px", minWidth: 120 }}
        >
          {/* Arrow pointing up */}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2"
            style={{
              width: 0, height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "6px solid var(--card)",
            }}
          />
          <div className="flex items-center gap-2">
            <span className="text-[20px]">{icon}</span>
            <div>
              <p className="text-[14px] font-semibold text-[var(--foreground)]">{name}</p>
              {rarity && (
                <p className="text-[12px] text-[var(--muted)] capitalize">{rarity}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
