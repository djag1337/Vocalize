"use client";

import { useState } from "react";
import Link from "next/link";

const TRENDING = ["#music", "#indierock", "#newreleases", "#concerts", "#vinylculture", "#lofi"];

const SUGGESTED_USERS = [
  { id: "1", name: "Jamie Rivera", username: "jamierivera", color: "#6366f1", initials: "JR" },
  { id: "2", name: "Alex Chen", username: "alexc", color: "#8b5cf6", initials: "AC" },
  { id: "3", name: "Mia Torres", username: "miatunes", color: "#ec4899", initials: "MT" },
  { id: "4", name: "Dev Patel", username: "devpatel", color: "#10b981", initials: "DP" },
];

export default function SearchIdle() {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setFollowing(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", paddingTop: "24px" }}>
      {/* Trending Topics */}
      <section>
        <h2
          className="font-semibold uppercase tracking-[0.08em]"
          style={{ marginBottom: "12px", fontSize: 11, color: "var(--muted)" }}
        >
          Trending
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {TRENDING.map(tag => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="font-medium"
              style={{
                background: "var(--surface-3)",
                color: "var(--accent)",
                padding: "7px 16px",
                border: "1px solid var(--border)",
                textDecoration: "none",
                display: "inline-block",
                borderRadius: 9999,
                fontSize: 14,
              }}
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* People You Might Know */}
      <section>
        <h2
          className="font-semibold uppercase tracking-[0.08em]"
          style={{ marginBottom: "12px", fontSize: 11, color: "var(--muted)" }}
        >
          People you might know
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {SUGGESTED_USERS.map(u => {
            const isFollowing = following.has(u.id);
            return (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 18px",
                  gap: "12px",
                  background: "var(--surface-3)",
                  borderRadius: 24,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                {/* Avatar circle */}
                <div
                  className="font-bold"
                  style={{
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    borderRadius: 9999,
                    background: u.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    color: "white",
                  }}
                >
                  {u.initials}
                </div>

                {/* Name + username */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-semibold" style={{ fontSize: 15, color: "var(--foreground)" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>@{u.username}</div>
                </div>

                {/* Follow toggle */}
                <button
                  onClick={() => toggle(u.id)}
                  className="font-semibold"
                  style={{
                    padding: "7px 18px",
                    borderRadius: 9999,
                    fontSize: 13,
                    background: isFollowing ? "transparent" : "var(--accent)",
                    color: isFollowing ? "var(--muted)" : "#fff",
                    border: isFollowing ? "1px solid var(--border)" : "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
