"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  feedDensity: string;
  displayBadgeId: string | null;
  badges: BadgeEntry[];
  nowPlaying: string | null;
};

const DENSITY_OPTIONS: { value: string; label: string }[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
  { value: "card", label: "Card" },
];

const THEME_SWATCHES = ["#a855f7", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#eab308"];
const ACCENT_SWATCHES = ["#ec4899", "#06b6d4", "#84cc16", "#f59e0b", "#6366f1", "#14b8a6"];

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
  const [feedDensity, setFeedDensity] = useState(initial.feedDensity ?? "comfortable");
  const [displayBadgeId, setDisplayBadgeId] = useState(initial.displayBadgeId ?? "");
  const [nowPlaying, setNowPlaying] = useState(initial.nowPlaying ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const themeColorInputRef = useRef<HTMLInputElement>(null);
  const accentColorInputRef = useRef<HTMLInputElement>(null);

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
        feedDensity,
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
            <FieldLabel>Avatar URL</FieldLabel>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input font-mono w-full"
              style={{ fontSize: 14 }}
              placeholder="https://..."
            />
          </div>
          <div>
            <FieldLabel>Banner URL</FieldLabel>
            <input
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="input font-mono w-full"
              style={{ fontSize: 14 }}
              placeholder="https://... (leave empty for color gradient)"
            />
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

      {/* ── Colors ── */}
      <Card>
        <SectionLabel>Colors</SectionLabel>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 24 }}
        >
          {/* Theme color */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Theme color</span>
            <button
              type="button"
              onClick={() => themeColorInputRef.current?.click()}
              className="transition cursor-pointer"
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
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
              style={{ fontSize: 13 }}
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
                    width: 24,
                    height: 24,
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
                width: 72,
                height: 72,
                borderRadius: 16,
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
              style={{ fontSize: 13 }}
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
                    width: 24,
                    height: 24,
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
      </Card>

      {/* ── Feed density ── */}
      <Card>
        <SectionLabel>Feed density</SectionLabel>
        <div className="flex" style={{ gap: 8 }}>
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFeedDensity(opt.value)}
              className="flex-1 font-medium border transition"
              style={{
                height: 40,
                fontSize: 14,
                borderRadius: 9999,
                borderColor: feedDensity === opt.value ? "var(--accent)" : "var(--border)",
                background: feedDensity === opt.value ? "var(--accent-soft)" : "transparent",
                color: feedDensity === opt.value ? "var(--accent)" : "var(--muted)",
              }}
            >
              {opt.label}
            </button>
          ))}
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
