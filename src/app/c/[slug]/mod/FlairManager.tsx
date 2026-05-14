"use client";
import { useState, useEffect } from "react";
import { Plus, Tag } from "lucide-react";

type Flair = { id: string; name: string; color: string };

const PRESET_COLORS = [
  "#a855f7", "#ec4899", "#3b82f6", "#10b981",
  "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6",
];

export default function FlairManager({ communityId }: { communityId: string }) {
  const [flairs, setFlairs] = useState<Flair[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/flairs?communityId=${communityId}`)
      .then((r) => r.json())
      .then((d) => setFlairs(d.flairs ?? []));
  }, [communityId]);

  async function createMark(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/flairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId, name: name.trim(), color }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to create flair");
      }
      const { flair: mark } = await res.json();
      setFlairs((prev) => [...prev, mark]);
      setName("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: 20,
      }}
    >
      {/* Existing flairs */}
      {flairs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {flairs.map((f) => (
            <span
              key={f.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: `${f.color}22`,
                color: f.color,
                border: `1px solid ${f.color}44`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: f.color,
                  flexShrink: 0,
                }}
              />
              {f.name}
            </span>
          ))}
        </div>
      )}

      {flairs.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: "var(--muted)", fontSize: 13 }}>
          <Tag size={14} />
          No marks yet — create one below.
        </div>
      )}

      {/* Create form */}
      <form onSubmit={createMark} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mark name"
            maxLength={32}
            style={{
              flex: 1,
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 14,
              color: "var(--foreground)",
              outline: "none",
            }}
          />
          {/* Preview pill */}
          {name.trim() && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: `${color}22`,
                color,
                border: `1px solid ${color}44`,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {name.trim()}
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: c,
                border: color === c ? "2px solid var(--foreground)" : "2px solid transparent",
                cursor: "pointer",
                outline: "none",
                flexShrink: 0,
                boxShadow: color === c ? `0 0 0 2px var(--background), 0 0 0 4px ${c}` : "none",
                transition: "box-shadow 0.15s",
              }}
            />
          ))}
          {/* Custom color picker */}
          <label
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px dashed var(--border)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
            title="Custom color"
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
            <Plus size={12} color="var(--muted)" />
          </label>
        </div>

        {err && (
          <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>
        )}

        <button
          type="submit"
          disabled={busy || !name.trim()}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 999,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: busy || !name.trim() ? "not-allowed" : "pointer",
            opacity: busy || !name.trim() ? 0.4 : 1,
          }}
        >
          <Plus size={13} /> Create mark
        </button>
      </form>
    </div>
  );
}
