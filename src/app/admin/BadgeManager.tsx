"use client";

import { useState } from "react";

type Badge = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: string;
};

type User = {
  id: string;
  username: string;
  displayName: string | null;
  accentColor: string | null;
};

type UserWithBadges = User & {
  badges: { badge: Badge; awardedAt: string }[];
};

const RARITY_COLORS: Record<string, string> = {
  common: "#94a3b8",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export default function BadgeManager({ allBadges }: { allBadges: Badge[] }) {
  // ── Assign/Revoke state ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithBadges | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [badgeActionLoading, setBadgeActionLoading] = useState<string | null>(null);
  const [badgeMsg, setBadgeMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ── Create badge state ──────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    name: "",
    icon: "",
    color: "#a855f7",
    rarity: "common",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [localBadges, setLocalBadges] = useState<Badge[]>(allBadges);

  // ── User search ─────────────────────────────────────────────────────────
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSelectedUser(null);
    setBadgeMsg(null);
    try {
      const res = await fetch(
        `/api/admin/users/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      setSearchResults(data.users ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function loadUser(user: User) {
    setLoadingUser(true);
    setBadgeMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/badges`);
      const data = await res.json();
      setSelectedUser({ ...user, badges: data.badges ?? [] });
    } catch {
      setSelectedUser({ ...user, badges: [] });
    } finally {
      setLoadingUser(false);
    }
  }

  async function handleBadgeAction(action: "award" | "revoke", badgeId: string) {
    if (!selectedUser) return;
    const key = `${action}-${badgeId}`;
    setBadgeActionLoading(key);
    setBadgeMsg(null);
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: selectedUser.id, badgeSlugOrId: badgeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBadgeMsg({ type: "err", text: data.error ?? "Something went wrong" });
      } else {
        setBadgeMsg({
          type: "ok",
          text: action === "award"
            ? `Awarded "${data.badge?.name}" to @${selectedUser.username}`
            : `Revoked "${data.badge?.name}" from @${selectedUser.username}`,
        });
        // Refresh user badges
        await loadUser(selectedUser);
      }
    } catch {
      setBadgeMsg({ type: "err", text: "Network error" });
    } finally {
      setBadgeActionLoading(null);
    }
  }

  // ── Create badge ────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/admin/badges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateMsg({ type: "err", text: data.error ?? "Failed to create badge" });
      } else {
        setCreateMsg({ type: "ok", text: `Badge "${data.badge.name}" created!` });
        setLocalBadges((prev) => [...prev, data.badge]);
        setCreateForm({ name: "", icon: "", color: "#a855f7", rarity: "common", description: "" });
      }
    } catch {
      setCreateMsg({ type: "err", text: "Network error" });
    } finally {
      setCreating(false);
    }
  }

  const userBadgeIds = new Set(selectedUser?.badges.map((ub) => ub.badge.id) ?? []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* ── Assign / Revoke ─────────────────────────────────────────── */}
      <div>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 18 }}>🏅</span>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Assign / Revoke Badges</h2>
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "9px 14px",
              fontSize: 14,
              color: "var(--foreground)",
              outline: "none",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              opacity: searching || !searchQuery.trim() ? 0.5 : 1,
            }}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && !selectedUser && (
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {searchResults.map((u, i) => {
              const color = u.accentColor || "#a855f7";
              return (
                <button
                  key={u.id}
                  onClick={() => { setSearchResults([]); loadUser(u); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: i < searchResults.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: `linear-gradient(135deg, ${color}88, ${color})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                      @{u.username}
                    </div>
                    {u.displayName && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.displayName}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !searching && !selectedUser && (
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            No users found for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {/* Selected user panel */}
        {loadingUser && (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading user...</p>
        )}

        {selectedUser && !loadingUser && (
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "16px 18px",
            }}
          >
            {/* User header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${selectedUser.accentColor ?? "#a855f7"}88, ${selectedUser.accentColor ?? "#a855f7"})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {selectedUser.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>@{selectedUser.username}</div>
                  {selectedUser.displayName && (
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{selectedUser.displayName}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setSelectedUser(null); setSearchQuery(""); setBadgeMsg(null); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>

            {/* Feedback message */}
            {badgeMsg && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 14,
                  background: badgeMsg.type === "ok" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${badgeMsg.type === "ok" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
                  color: badgeMsg.type === "ok" ? "#34d399" : "#fca5a5",
                }}
              >
                {badgeMsg.text}
              </div>
            )}

            {/* Current badges */}
            {selectedUser.badges.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
                  Current badges
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedUser.badges.map((ub) => (
                    <span
                      key={ub.badge.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: `${ub.badge.color}18`,
                        border: `1px solid ${ub.badge.color}40`,
                        fontSize: 13,
                        fontWeight: 600,
                        color: ub.badge.color,
                      }}
                    >
                      {ub.badge.icon} {ub.badge.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* All badges grid */}
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", marginBottom: 10, textTransform: "uppercase" }}>
              All badges — click to award or revoke
            </div>
            {localBadges.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No badges exist yet. Create one below.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {localBadges.map((badge) => {
                  const has = userBadgeIds.has(badge.id);
                  const actionKey = `${has ? "revoke" : "award"}-${badge.id}`;
                  const isLoading = badgeActionLoading === actionKey;
                  const rarityColor = RARITY_COLORS[badge.rarity] ?? "#94a3b8";
                  return (
                    <div
                      key={badge.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: has ? `${badge.color}0d` : "transparent",
                        border: `1px solid ${has ? badge.color + "30" : "var(--border)"}`,
                      }}
                    >
                      {/* Badge preview */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${badge.color}20`,
                          border: `1px solid ${badge.color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {badge.icon}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>
                            {badge.name}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 999,
                              background: `${rarityColor}18`,
                              color: rarityColor,
                              border: `1px solid ${rarityColor}30`,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {badge.rarity}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {badge.description}
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => handleBadgeAction(has ? "revoke" : "award", badge.id)}
                        disabled={isLoading}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: isLoading ? "default" : "pointer",
                          opacity: isLoading ? 0.5 : 1,
                          flexShrink: 0,
                          border: has
                            ? "1px solid rgba(239,68,68,0.3)"
                            : `1px solid ${badge.color}50`,
                          background: has
                            ? "rgba(239,68,68,0.08)"
                            : `${badge.color}15`,
                          color: has ? "#fca5a5" : badge.color,
                        }}
                      >
                        {isLoading ? "..." : has ? "Revoke" : "Award"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Badge ─────────────────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 18 }}>✨</span>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Create New Badge</h2>
        </div>

        <form
          onSubmit={handleCreate}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Name + Icon row */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Early Adopter"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                style={{
                  width: "100%",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "var(--foreground)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ width: 90 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Icon (emoji)
              </label>
              <input
                type="text"
                required
                placeholder="🏅"
                value={createForm.icon}
                onChange={(e) => setCreateForm((f) => ({ ...f, icon: e.target.value }))}
                style={{
                  width: "100%",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 20,
                  textAlign: "center",
                  color: "var(--foreground)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Color + Rarity row */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={createForm.color}
                  onChange={(e) => setCreateForm((f) => ({ ...f, color: e.target.value }))}
                  style={{
                    width: 36,
                    height: 36,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: 2,
                    background: "var(--background)",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>
                  {createForm.color}
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Rarity
              </label>
              <select
                value={createForm.rarity}
                onChange={(e) => setCreateForm((f) => ({ ...f, rarity: e.target.value }))}
                style={{
                  width: "100%",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "var(--foreground)",
                  outline: "none",
                }}
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              required
              placeholder="What did the user do to earn this badge?"
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              style={{
                width: "100%",
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 14,
                color: "var(--foreground)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Preview */}
          {(createForm.name || createForm.icon) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Preview:</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: `${createForm.color}18`,
                  border: `1px solid ${createForm.color}40`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: createForm.color,
                }}
              >
                {createForm.icon || "?"} {createForm.name || "Badge Name"}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: `${RARITY_COLORS[createForm.rarity] ?? "#94a3b8"}18`,
                  color: RARITY_COLORS[createForm.rarity] ?? "#94a3b8",
                  border: `1px solid ${RARITY_COLORS[createForm.rarity] ?? "#94a3b8"}30`,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {createForm.rarity}
              </span>
            </div>
          )}

          {/* Feedback */}
          {createMsg && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: createMsg.type === "ok" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${createMsg.type === "ok" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: createMsg.type === "ok" ? "#34d399" : "#fca5a5",
              }}
            >
              {createMsg.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: creating ? "default" : "pointer",
              opacity: creating ? 0.6 : 1,
              alignSelf: "flex-start",
            }}
          >
            {creating ? "Creating..." : "Create Badge"}
          </button>
        </form>
      </div>

    </div>
  );
}
