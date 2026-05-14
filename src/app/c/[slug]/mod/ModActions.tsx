"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Tag, Pencil, AlertTriangle } from "lucide-react";

type Flair = { id: string; name: string; color: string };

type Props = {
  reportId: string;
  targetType: "post" | "comment" | "unknown";
  targetId: string;
  communityId: string;
  postTitle?: string;
  postContent?: string;
};

export default function ModActions({
  reportId,
  targetType,
  targetId,
  communityId,
  postTitle,
  postContent,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // — Existing: remove modal —
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");

  // — New: delete modal —
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // — New: edit form —
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState(postTitle ?? "");
  const [editContent, setEditContent] = useState(postContent ?? "");

  // — New: mark picker —
  const [showMarkPicker, setShowMarkPicker] = useState(false);
  const [flairs, setFlairs] = useState<Flair[]>([]);
  const [flairsLoading, setFlairsLoading] = useState(false);

  async function call(action: string, opts?: { targetId?: string; targetType?: string; reason?: string }) {
    setBusy(true);
    const body = {
      action,
      communityId,
      targetType: opts?.targetType ?? "report",
      targetId: opts?.targetId ?? reportId,
      reason: opts?.reason,
    };
    await fetch("/api/mod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  async function submitRemove() {
    setShowRemoveModal(false);
    if (targetType === "post") {
      await call("remove_post", { targetId, targetType: "post", reason: removeReason });
    } else if (targetType === "comment") {
      await call("remove_comment", { targetId, targetType: "comment", reason: removeReason });
    }
    await call("resolve_report");
    setRemoveReason("");
  }

  async function submitDelete() {
    setShowDeleteModal(false);
    await call("delete_post", { targetId, targetType: "post" });
  }

  async function submitEdit() {
    if (!editTitle.trim()) return;
    setBusy(true);
    setShowEditForm(false);
    await fetch(`/api/posts/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent, modOverride: true }),
    });
    setBusy(false);
    router.refresh();
  }

  async function openMarkPicker() {
    setShowMarkPicker((v) => !v);
    if (flairs.length === 0 && !flairsLoading) {
      setFlairsLoading(true);
      const res = await fetch(`/api/flairs?communityId=${communityId}`);
      const data = await res.json();
      setFlairs(data.flairs ?? []);
      setFlairsLoading(false);
    }
  }

  async function applyMark(flairId: string | null) {
    setShowMarkPicker(false);
    setBusy(true);
    await fetch(`/api/posts/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flairId, modOverride: true }),
    });
    setBusy(false);
    router.refresh();
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

  return (
    <>
      {/* ── Remove modal (existing) ── */}
      {showRemoveModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowRemoveModal(false)}
        >
          <div
            style={{
              background: "var(--surface-2)",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--foreground)" }}>
              Remove {targetType}
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              Optionally let the user know why their content was removed.
            </p>
            <textarea
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              rows={3}
              placeholder="Removal reason (optional)"
              style={{ ...inputStyle, resize: "none", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowRemoveModal(false); setRemoveReason(""); }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitRemove}
                disabled={busy}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: "var(--red)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: "var(--surface-2)",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={18} style={{ color: "var(--red)" }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                Permanently delete post?
              </h3>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20, lineHeight: 1.5 }}>
              This will hard-delete the post and all its comments. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitDelete}
                disabled={busy}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: "var(--red)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={13} /> Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report action buttons ── */}
      <div className="flex flex-wrap" style={{ gap: 8, marginTop: 8 }}>
        {targetType !== "unknown" && (
          <button
            onClick={() => setShowRemoveModal(true)}
            disabled={busy}
            className="inline-flex items-center font-medium disabled:opacity-50"
            style={{
              gap: 6,
              padding: "6px 12px",
              borderRadius: 9999,
              fontSize: 12,
              background: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <Trash2 size={14} /> Remove + Resolve
          </button>
        )}
        <button
          onClick={() => call("resolve_report")}
          disabled={busy}
          className="inline-flex items-center font-medium disabled:opacity-50"
          style={{
            gap: 6,
            padding: "6px 12px",
            borderRadius: 9999,
            fontSize: 12,
            background: "rgba(16,185,129,0.15)",
            color: "#6ee7b7",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          <Check size={14} /> Resolve
        </button>
        <button
          onClick={() => call("dismiss_report")}
          disabled={busy}
          className="inline-flex items-center font-medium disabled:opacity-50"
          style={{
            gap: 6,
            padding: "6px 12px",
            borderRadius: 9999,
            fontSize: 12,
            background: "rgba(255,255,255,0.05)",
            color: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          <X size={14} /> Dismiss
        </button>
      </div>

      {/* ── Post-specific actions (only when targetType === "post") ── */}
      {targetType === "post" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />

          {/* Post action buttons */}
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={busy}
              className="inline-flex items-center font-medium disabled:opacity-50"
              style={{
                gap: 6,
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 12,
                background: "rgba(239,68,68,0.08)",
                color: "var(--red)",
                border: "1px solid rgba(239,68,68,0.25)",
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} /> Delete post
            </button>

            <button
              onClick={() => setShowEditForm((v) => !v)}
              disabled={busy}
              className="inline-flex items-center font-medium disabled:opacity-50"
              style={{
                gap: 6,
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 12,
                background: "rgba(255,255,255,0.05)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <Pencil size={13} /> Edit post
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={openMarkPicker}
                disabled={busy}
                className="inline-flex items-center font-medium disabled:opacity-50"
                style={{
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 9999,
                  fontSize: 12,
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                <Tag size={13} /> Add mark
              </button>

              {/* Mark picker dropdown */}
              {showMarkPicker && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    zIndex: 100,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: 10,
                    minWidth: 180,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  {flairsLoading ? (
                    <p style={{ fontSize: 12, color: "var(--muted)", padding: "4px 6px" }}>Loading marks…</p>
                  ) : flairs.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--muted)", padding: "4px 6px" }}>No marks in this space</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {flairs.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => applyMark(f.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: f.color,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, color: "var(--foreground)" }}>{f.name}</span>
                        </button>
                      ))}
                      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                      <button
                        onClick={() => applyMark(null)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <X size={10} style={{ color: "var(--muted)", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>Clear mark</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit post inline form */}
          {showEditForm && (
            <div
              style={{
                marginTop: 10,
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, fontWeight: 600 }}>
                Edit post content
              </p>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post title"
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                placeholder="Post content (optional)"
                style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowEditForm(false)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--muted)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  disabled={busy || !editTitle.trim()}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: busy || !editTitle.trim() ? "not-allowed" : "pointer",
                    opacity: busy || !editTitle.trim() ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={12} /> Save changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
