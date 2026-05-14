"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

const PRESET_COLORS = [
  "#ec4899", "#a855f7", "#3b82f6", "#10b981",
  "#f59e0b", "#ef4444", "#06b6d4", "#f97316",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-3)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  color: "var(--foreground)",
  outline: "none",
  boxSizing: "border-box",
};

export default function NewCommunityForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [themeColor, setThemeColor] = useState(PRESET_COLORS[0]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!slug.trim() || !name.trim()) {
      setErr("Slug and name are required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, description, themeColor }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "failed");
      }
      const c = await res.json();
      router.push(`/c/${c.slug}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  // Live preview avatar
  const previewInitial = name.trim() ? name.trim()[0].toUpperCase() : slug.trim() ? slug.trim()[0].toUpperCase() : "C";

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {/* Live preview avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${themeColor}88, ${themeColor})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          {previewInitial}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
            {name.trim() || "New Space"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            {slug.trim() ? `c/${slug.trim()}` : "c/your-slug"}
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--surface-3)",
          borderRadius: 24,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <Field label="Slug — used in the URL">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="cool-stuff"
            maxLength={32}
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: -4 }}>
            vocalize.app/c/{slug || "cool-stuff"}
          </p>
        </Field>

        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cool Stuff"
            maxLength={48}
            style={inputStyle}
          />
        </Field>

        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this space about?"
            maxLength={300}
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
          />
        </Field>

        <Field label="Theme color">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setThemeColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: c,
                  border: themeColor === c ? "2px solid var(--foreground)" : "2px solid transparent",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: themeColor === c ? `0 0 0 2px var(--surface-3), 0 0 0 4px ${c}` : "none",
                  transition: "box-shadow 0.15s",
                  flexShrink: 0,
                }}
              />
            ))}
            {/* Custom picker */}
            <label
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px dashed var(--border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
              title="Custom color"
            >
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
              />
              <span style={{ fontSize: 16, color: "var(--muted)", pointerEvents: "none" }}>+</span>
            </label>
          </div>
        </Field>
      </div>

      {err && (
        <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>
      )}

      <button
        type="submit"
        disabled={busy || !slug.trim() || !name.trim()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 52,
          borderRadius: 999,
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: busy || !slug.trim() || !name.trim() ? "not-allowed" : "pointer",
          opacity: busy || !slug.trim() || !name.trim() ? 0.4 : 1,
          transition: "opacity 0.15s",
        }}
      >
        <Users size={17} strokeWidth={2} />
        {busy ? "Creating…" : "Create space"}
      </button>
    </form>
  );
}
