import Link from "next/link";

export default function Avatar({ username, accentColor, size = "md", href }: {
  username: string;
  accentColor?: string | null;
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const cls = size === "sm" ? "avatar avatar-sm" : size === "lg" ? "avatar avatar-lg" : "avatar";
  const initial = (username[0] || "?").toUpperCase();
  const style = accentColor ? { background: `linear-gradient(135deg, ${accentColor}, #ec4899)` } : undefined;
  const inner = <span className={cls} style={style}>{initial}</span>;
  if (href) return <Link href={href} className="hover:opacity-90">{inner}</Link>;
  return inner;
}
