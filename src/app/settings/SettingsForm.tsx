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
      setMsg("saved ");
      router.refresh();
    } else {
      setMsg("something broke ");
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Live preview */}
      <div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${themeColor}33, ${accentColor}33)` }}
      >
        {/* Banner preview */}
        {bannerUrl ? (
          <div className="h-24 w-full relative">
            <img src={bannerUrl} alt="banner preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="h-24 w-full"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${accentColor})` }}
          />
        )}
        <div className="p-4 pt-3 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0"
            style={{ borderColor: accentColor, background: themeColor }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (displayName || initial.username)[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-bold text-lg" style={{ color: accentColor }}>
                {displayName || initial.username}
              </div>
              {selectedBadge && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
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
            <div className="text-gray-300 text-sm">@{initial.username}</div>
            {bio && <div className="text-sm text-gray-200 mt-1 max-w-md">{bio}</div>}
          </div>
        </div>
      </div>

      {/* Color picker */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 space-y-4">
        <label className="block text-sm font-medium">Colors</label>
        <div className="grid grid-cols-2 gap-6">
          {/* Theme color */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400">Theme color</div>
            {/* Large swatch */}
            <button
              type="button"
              onClick={() => themeColorInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-white/20 hover:border-white/50 transition cursor-pointer shrink-0"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}
              aria-label="Pick theme color"
            />
            {/* Hidden native color input */}
            <input
              ref={themeColorInputRef}
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="sr-only"
            />
            {/* Hex text input */}
            <input
              type="text"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm font-mono"
              placeholder="#a855f7"
            />
            {/* Quick swatches */}
            <div className="flex gap-1.5 flex-wrap">
              {THEME_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setThemeColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition hover:scale-110"
                  style={{
                    background: c,
                    borderColor: themeColor === c ? "white" : "transparent",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400">Accent color</div>
            <button
              type="button"
              onClick={() => accentColorInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-white/20 hover:border-white/50 transition cursor-pointer shrink-0"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
              aria-label="Pick accent color"
            />
            <input
              ref={accentColorInputRef}
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm font-mono"
              placeholder="#ec4899"
            />
            <div className="flex gap-1.5 flex-wrap">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition hover:scale-110"
                  style={{
                    background: c,
                    borderColor: accentColor === c ? "white" : "transparent",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live gradient preview strip */}
        <div
          className="h-8 w-full rounded-xl border border-white/10"
          style={{ background: `linear-gradient(135deg, ${themeColor}, ${accentColor})` }}
        />
      </div>

      {/* Profile fields */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2"
            placeholder={initial.username}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 resize-none"
            placeholder="tell the world who you are..."
          />
          <div className="text-xs text-gray-500 mt-1">{bio.length}/300</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Banner URL</label>
          <input
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm"
            placeholder="https://... (leave empty for color gradient)"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Now Playing 🎵</label>
          <input
            value={nowPlaying}
            onChange={(e) => setNowPlaying(e.target.value)}
            maxLength={200}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2"
            placeholder="Artist — Song  or paste a Spotify URL"
          />
        </div>
      </div>

      {/* Feed density */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
        <label className="block text-sm font-medium mb-3">Feed density</label>
        <div className="flex gap-2">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFeedDensity(opt.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${
                feedDensity === opt.value
                  ? "border-pink-500 bg-pink-500/20 text-pink-300"
                  : "border-white/10 hover:bg-white/10 text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Display badge */}
      {initial.badges.length > 0 && (
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
          <label className="block text-sm font-medium mb-3">Display badge</label>
          <p className="text-xs text-gray-400 mb-3">
            Shown next to your name everywhere on the site.
          </p>
          <div className="flex flex-wrap gap-2">
            {/* None option */}
            <button
              type="button"
              onClick={() => setDisplayBadgeId("")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                displayBadgeId === ""
                  ? "border-white/50 bg-white/20 text-white"
                  : "border-white/20 hover:bg-white/10 text-gray-400"
              }`}
            >
              None
            </button>
            {initial.badges.map((b) => (
              <button
                key={b.badge.id}
                type="button"
                onClick={() => setDisplayBadgeId(b.badge.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition"
                style={
                  displayBadgeId === b.badge.id
                    ? {
                        background: `${b.badge.color}40`,
                        borderColor: b.badge.color,
                        color: b.badge.color,
                        boxShadow: `0 0 0 1px ${b.badge.color}66`,
                      }
                    : {
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
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 font-medium disabled:opacity-50"
        >
          {saving ? "saving..." : "save changes "}
        </button>
        {msg && <span className="text-sm text-gray-300">{msg}</span>}
      </div>
    </form>
  );
}
