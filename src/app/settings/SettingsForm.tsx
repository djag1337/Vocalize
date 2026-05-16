"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";

type BadgeEntry = {
  id: string;
  badge: { id: string; slug: string; name: string; icon: string; color: string };
};

type Initial = {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  themeColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  displayBadgeId: string | null;
  badges: BadgeEntry[];
  nowPlaying: string | null;
};

const THEME_SWATCHES = ["#a855f7", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#eab308"];
const ACCENT_SWATCHES = ["#ec4899", "#06b6d4", "#84cc16", "#f59e0b", "#6366f1", "#14b8a6"];
const BG_SWATCHES = ["#0a0a0c", "#000000", "#0d0d14", "#0a0f1a", "#100a14", "#0a1210"];

const FONT_OPTIONS = [
  { slug: "inter",    name: "Inter",    stack: "Inter, sans-serif" },
  { slug: "geist",    name: "Geist",    stack: "Geist, sans-serif" },
  { slug: "playfair", name: "Playfair", stack: "'Playfair Display', serif" },
  { slug: "dm-sans",  name: "DM Sans",  stack: "'DM Sans', sans-serif" },
  { slug: "mono",     name: "Mono",     stack: "'JetBrains Mono', monospace" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-semibold uppercase tracking-widest"
      style={{ marginBottom: 16, fontSize: 12, color: "var(--muted)" }}
    >
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block"
      style={{ marginBottom: 6, fontSize: 13, color: "var(--muted)" }}
    >
      {children}
    </label>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="flex flex-col"
      style={{
        borderRadius: 24,
        padding: "24px 24px",
        background: "var(--surface-3)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl ?? "");
  const [themeColor, setThemeColor] = useState(initial.themeColor);
  const [accentColor, setAccentColor] = useState(initial.accentColor);
  const [backgroundColor, setBackgroundColor] = useState(initial.backgroundColor ?? "#0a0a0c");
  const [fontFamily, setFontFamily] = useState(initial.fontFamily ?? "inter");
  const [displayBadgeId, setDisplayBadgeId] = useState(initial.displayBadgeId ?? "");
  const [nowPlaying, setNowPlaying] = useState(initial.nowPlaying ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);

  const themeColorInputRef = useRef<HTMLInputElement>(null);
  const accentColorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, field: "avatar" | "banner") {
    setUploading(field);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(null);
    if (!res.ok) { setMsg("Upload failed"); return; }
    const { url } = await res.json();
    if (field === "avatar") setAvatarUrl(url);
    else setBannerUrl(url);
  }

  const selectedBadge = initial.badges.find((b) => b.badge.id === displayBadgeId)?.badge ?? null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio,
        avatarUrl,
        bannerUrl,
        themeColor,
        accentColor,
        backgroundColor,
        fontFamily,
        displayBadgeId,
        nowPlaying,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("Saved ✓");
      router.refresh();
    } else {
      setMsg("Something went wrong");
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col" style={{ gap: 16 }}>

      {/* ── Profile preview ── */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {bannerUrl ? (
          <div style={{ height: 96 }} className="w-full">
            <img src={bannerUrl} alt="banner" className="w-full" style={{ height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div
            className="w-full"
            style={{ height: 96, background: `linear-gradient(135deg, ${themeColor}, ${accentColor})` }}
          />
        )}
        <div className="flex items-center" style={{ padding: "16px 24px 20px 24px", gap: 16 }}>
          <div
            className="flex items-center justify-center font-bold overflow-hidden shrink-0"
            style={{
              width: 64,
              height: 64,
              borderRadius: 9999,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: accentColor,
              background: themeColor,
              color: "white",
              fontSize: 22,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full" style={{ height: "100%", objectFit: "cover" }} />
            ) : (
              (displayName || initial.username)[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
              <span className="font-bold" style={{ fontSize: 17, color: "var(--foreground)" }}>
                {displayName || initial.username}
              </span>
              {selectedBadge && (
                <span
                  className="inline-flex items-center font-semibold border"
                  style={{
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    fontSize: 12,
                    background: `${selectedBadge.color}33`,
                    borderColor: `${selectedBadge.color}66`,
                    color: selectedBadge.color,
                  }}
                >
                  <span>{selectedBadge.icon}</span>
                  <span>{selectedBadge.name}</span>
                </span>
              )}
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>@{initial.username}</div>
            {bio && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{bio}</div>}
          </div>
        </div>
      </Card>

      {/* ── Profile fields ── */}
      <Card>
        <SectionLabel>Profile</SectionLabel>
        <div className="flex flex-col" style={{ gap: 16 }}>
          <div>
            <FieldLabel>Display name</FieldLabel>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="input w-full"
              style={{ fontSize: 15 }}
              placeholder={initial.username}
            />
          </div>
          <div>
            <FieldLabel>Bio</FieldLabel>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
              className="input resize-none w-full"
              style={{ fontSize: 15 }}
              placeholder="tell the world who you are..."
            />
            <span style={{ display: "block", marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
              {bio.length}/300
            </span>
          </div>
          <div>
            <FieldLabel>Avatar</FieldLabel>
            <div className="flex items-center" style={{ gap: 10 }}>
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploading === "avatar"}
                className="inline-flex items-center font-medium border transition"
                style={{ gap: 8, height: 38, padding: "0 16px", borderRadius: 9999, fontSize: 13, borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface-3)", cursor: uploading === "avatar" ? "wait" : "pointer" }}
              >
                <ImageIcon size={14} />
                {uploading === "avatar" ? "Uploading…" : "Choose photo"}
              </button>
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "avatar"); }}
              />
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="input font-mono flex-1"
                style={{ fontSize: 13 }}
                placeholder="or paste a URL"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Banner</FieldLabel>
            <div className="flex items-center" style={{ gap: 10 }}>
              <button
                type="button"
                onClick={() => bannerFileRef.current?.click()}
                disabled={uploading === "banner"}
                className="inline-flex items-center font-medium border transition"
                style={{ gap: 8, height: 38, padding: "0 16px", borderRadius: 9999, fontSize: 13, borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface-3)", cursor: uploading === "banner" ? "wait" : "pointer" }}
              >
                <ImageIcon size={14} />
                {uploading === "banner" ? "Uploading…" : "Choose photo"}
              </button>
              <input
                ref={bannerFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, "banner"); }}
              />
              <input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="input font-mono flex-1"
                style={{ fontSize: 13 }}
                placeholder="or paste URL (empty = gradient)"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Now Playing</FieldLabel>
            <input
              value={nowPlaying}
              onChange={(e) => setNowPlaying(e.target.value)}
              maxLength={200}
              className="input w-full"
              style={{ fontSize: 15 }}
              placeholder="Artist — Song  or paste a Spotify URL"
            />
          </div>
        </div>
      </Card>

      {/* ── Appearance ── */}
      <Card>
        <SectionLabel>Appearance</SectionLabel>
        <p style={{ marginBottom: 20, fontSize: 13, color: "var(--muted)", marginTop: -8 }}>
          These settings apply across your entire Vocalize experience.
        </p>

        {/* Colors row */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}
        >
          {/* Theme color */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Theme color</span>
            <button
              type="button"
              onClick={() => themeColorInputRef.current?.click()}
              className="transition cursor-pointer"
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                border: "2px solid rgba(255,255,255,0.2)",
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)`,
              }}
              aria-label="Pick theme color"
            />
            <input ref={themeColorInputRef} type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="sr-only" />
            <input
              type="text"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="input font-mono"
              style={{ fontSize: 12 }}
              placeholder="#a855f7"
            />
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {THEME_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setThemeColor(c)}
                  className="transition hover:scale-110"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    borderWidth: 2,
                    borderStyle: "solid",
                    background: c,
                    borderColor: themeColor === c ? "white" : "transparent",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Accent color</span>
            <button
              type="button"
              onClick={() => accentColorInputRef.current?.click()}
              className="transition cursor-pointer"
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                border: "2px solid rgba(255,255,255,0.2)",
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
              }}
              aria-label="Pick accent color"
            />
            <input ref={accentColorInputRef} type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="sr-only" />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="input font-mono"
              style={{ fontSize: 12 }}
              placeholder="#ec4899"
            />
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className="transition hover:scale-110"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    borderWidth: 2,
                    borderStyle: "solid",
                    background: c,
                    borderColor: accentColor === c ? "white" : "transparent",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Background color */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Background</span>
            <button
              type="button"
              onClick={() => bgColorInputRef.current?.click()}
              className="transition cursor-pointer"
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                border: "2px solid rgba(255,255,255,0.2)",
                background: backgroundColor,
                position: "relative",
              }}
              aria-label="Pick background color"
            >
              {/* Grid pattern to show darkness */}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  background: "repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%) 0 0 / 12px 12px",
                }}
              />
            </button>
            <input ref={bgColorInputRef} type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="sr-only" />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="input font-mono"
              style={{ fontSize: 12 }}
              placeholder="#0a0a0c"
            />
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {BG_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBackgroundColor(c)}
                  className="transition hover:scale-110"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    borderWidth: 2,
                    borderStyle: "solid",
                    background: c,
                    borderColor: backgroundColor === c ? "white" : "rgba(255,255,255,0.25)",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Gradient preview */}
        <div
          style={{
            height: 32,
            marginTop: 20,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.1)",
            background: `linear-gradient(135deg, ${themeColor}, ${accentColor})`,
          }}
        />

        {/* Font selector */}
        <div style={{ marginTop: 24 }}>
          <span style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 12 }}>Font</span>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {FONT_OPTIONS.map((f) => {
              const selected = fontFamily === f.slug;
              return (
                <button
                  key={f.slug}
                  type="button"
                  onClick={() => setFontFamily(f.slug)}
                  className="transition"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "2px solid",
                    borderColor: selected ? "var(--accent)" : "rgba(255,255,255,0.1)",
                    background: selected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    boxShadow: selected ? "0 0 0 1px var(--accent)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    minWidth: 80,
                  }}
                >
                  <span
                    style={{
                      fontFamily: f.stack,
                      fontSize: 18,
                      fontWeight: 700,
                      color: selected ? "var(--foreground)" : "var(--muted)",
                      lineHeight: 1.2,
                      letterSpacing: f.slug === "mono" ? "-0.03em" : "normal",
                    }}
                  >
                    Aa
                  </span>
                  <span
                    style={{
                      fontFamily: f.stack,
                      fontSize: 11,
                      color: selected ? "var(--foreground)" : "var(--muted-2)",
                      fontWeight: 500,
                    }}
                  >
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Display badge ── */}
      {initial.badges.length > 0 && (
        <Card>
          <SectionLabel>Display badge</SectionLabel>
          <p style={{ marginBottom: 14, fontSize: 13, color: "var(--muted)" }}>
            Shown next to your name everywhere on the site.
          </p>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={() => setDisplayBadgeId("")}
              className="inline-flex items-center font-semibold border transition"
              style={{
                gap: 6,
                padding: "6px 16px",
                fontSize: 13,
                borderRadius: 9999,
                borderColor: displayBadgeId === "" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                background: displayBadgeId === "" ? "rgba(255,255,255,0.15)" : "transparent",
                color: displayBadgeId === "" ? "var(--foreground)" : "var(--muted)",
              }}
            >
              None
            </button>
            {initial.badges.map((b) => (
              <button
                key={b.badge.id}
                type="button"
                onClick={() => setDisplayBadgeId(b.badge.id)}
                className="inline-flex items-center font-semibold border transition"
                style={
                  displayBadgeId === b.badge.id
                    ? {
                        gap: 6,
                        padding: "6px 16px",
                        fontSize: 13,
                        borderRadius: 9999,
                        background: `${b.badge.color}40`,
                        borderColor: b.badge.color,
                        color: b.badge.color,
                        boxShadow: `0 0 0 1px ${b.badge.color}66`,
                      }
                    : {
                        gap: 6,
                        padding: "6px 16px",
                        fontSize: 13,
                        borderRadius: 9999,
                        background: `${b.badge.color}1a`,
                        borderColor: `${b.badge.color}44`,
                        color: b.badge.color,
                      }
                }
              >
                <span>{b.badge.icon}</span>
                <span>{b.badge.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Save ── */}
      <div className="flex items-center" style={{ paddingTop: 4, gap: 12 }}>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center font-semibold transition-opacity"
          style={{
            height: 48,
            paddingLeft: 40,
            paddingRight: 40,
            fontSize: 15,
            borderRadius: 9999,
            background: "var(--accent)",
            color: "#fff",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {msg && (
          <span style={{ fontSize: 14, color: "var(--muted)" }}>{msg}</span>
        )}
      </div>
    </form>
  );
}
