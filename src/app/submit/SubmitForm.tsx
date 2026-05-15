"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bold, Italic, Strikethrough, Code, Link, Heading2,
  Quote, List, Image, Music, AlignLeft, Eye, Pencil,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

// ── Types ────────────────────────────────────────────────────────────────────
type PostType = "text" | "image" | "music";
type Flair = { id: string; name: string; color: string };

// ── Helpers ──────────────────────────────────────────────────────────────────
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  setter: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || "text";
  const next =
    textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
  setter(next);
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
  }, 0);
}

function prependLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  setter: (v: string) => void
) {
  const start = textarea.selectionStart;
  const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
  const next =
    textarea.value.slice(0, lineStart) + prefix + textarea.value.slice(lineStart);
  setter(next);
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length);
  }, 0);
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-semibold uppercase tracking-widest"
      style={{ marginBottom: 14, fontSize: 12, color: "var(--muted)" }}
    >
      {children}
    </p>
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

// ── Spotify URL helper ────────────────────────────────────────────────────────
function toSpotifyEmbed(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SubmitForm({
  communities,
}: {
  communities: { id: string; slug: string; name: string }[];
}) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [musicUrl, setMusicUrl] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [flairs, setFlairs] = useState<Flair[]>([]);
  const [selectedFlairId, setSelectedFlairId] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const spotifyEmbed = postType === "music" ? toSpotifyEmbed(musicUrl) : null;

  // Fetch flairs when community changes
  useEffect(() => {
    setSelectedFlairId("");
    if (!communityId) {
      setFlairs([]);
      return;
    }
    fetch(`/api/flairs?communityId=${communityId}`)
      .then((r) => r.json())
      .then((d) => setFlairs(d.flairs ?? []))
      .catch(() => setFlairs([]));
  }, [communityId]);

  // ── Toolbar actions ─────────────────────────────────────────────────────────
  const toolbar = useCallback(
    (action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      switch (action) {
        case "bold":        return wrapSelection(ta, "**", "**", setContent);
        case "italic":      return wrapSelection(ta, "*", "*", setContent);
        case "strike":      return wrapSelection(ta, "~~", "~~", setContent);
        case "code":        return wrapSelection(ta, "`", "`", setContent);
        case "link":        return wrapSelection(ta, "[", "](url)", setContent);
        case "h2":          return prependLine(ta, "## ", setContent);
        case "quote":       return prependLine(ta, "> ", setContent);
        case "list":        return prependLine(ta, "- ", setContent);
      }
    },
    []
  );

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!title.trim()) { setErr("Title is required"); return; }
    if (postType === "image" && !imageUrl.trim()) { setErr("Image URL is required"); return; }
    if (postType === "music" && !musicUrl.trim()) { setErr("Music URL is required"); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          postType,
          imageUrl: postType === "image" ? imageUrl : undefined,
          musicUrl: postType === "music" ? musicUrl : undefined,
          communitySlug: communitySlug || undefined,
          flairId: selectedFlairId || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "failed");
      }
      const post = await res.json();
      router.push(`/p/${post.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "something broke");
      setBusy(false);
    }
  }

  // ── Select community helper ─────────────────────────────────────────────────
  function selectCommunity(slug: string, id: string) {
    setCommunitySlug(slug);
    setCommunityId(id);
  }

  // ── Post-type tabs ──────────────────────────────────────────────────────────
  const TYPE_TABS: { type: PostType; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string }[] = [
    { type: "text",  Icon: AlignLeft, label: "Text"  },
    { type: "image", Icon: Image,     label: "Image" },
    { type: "music", Icon: Music,     label: "Music" },
  ];

  // ── Toolbar buttons ─────────────────────────────────────────────────────────
  const TOOLBAR: { action: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string }[] = [
    { action: "bold",   Icon: Bold,          title: "Bold"        },
    { action: "italic", Icon: Italic,        title: "Italic"      },
    { action: "strike", Icon: Strikethrough, title: "Strikethrough" },
    { action: "code",   Icon: Code,          title: "Inline code" },
    { action: "link",   Icon: Link,          title: "Link"        },
    { action: "h2",     Icon: Heading2,      title: "Heading"     },
    { action: "quote",  Icon: Quote,         title: "Quote"       },
    { action: "list",   Icon: List,          title: "List"        },
  ];

  return (
    <form onSubmit={submit} className="flex flex-col" style={{ gap: 16 }}>

      {/* ── Post type tabs ── */}
      <div
        className="flex"
        style={{
          padding: 4,
          gap: 4,
          background: "var(--surface-3)",
          borderRadius: 9999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {TYPE_TABS.map(({ type, Icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => { setPostType(type); setErr(""); setPreviewing(false); }}
            className="flex-1 flex items-center justify-center font-semibold transition-all"
            style={{
              gap: 8,
              height: 40,
              fontSize: 14,
              borderRadius: 9999,
              background: postType === type ? "var(--accent)" : "transparent",
              color: postType === type ? "#fff" : "var(--muted)",
            }}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Post content card ── */}
      <Card>
        <SectionLabel>{postType === "text" ? "Post" : postType === "image" ? "Image Post" : "Music Post"}</SectionLabel>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full font-semibold placeholder:text-[var(--muted-2)]"
          style={{
            fontSize: 18,
            marginBottom: 16,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--foreground)",
          }}
          placeholder="Title"
        />

        {/* Divider */}
        <div className="w-full" style={{ height: 1, marginBottom: 16, background: "var(--border)" }} />

        {/* ── TEXT: markdown toolbar + textarea / preview ── */}
        {postType === "text" && (
          <>
            {/* Toolbar row + Write/Preview toggle */}
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              {/* Formatting buttons — hidden while previewing */}
              <div className="flex items-center flex-wrap" style={{ gap: 2, visibility: previewing ? "hidden" : "visible" }}>
                {TOOLBAR.map(({ action, Icon, title: ttl }) => (
                  <button
                    key={action}
                    type="button"
                    title={ttl}
                    onMouseDown={(e) => { e.preventDefault(); toolbar(action); }}
                    className="flex items-center justify-center transition-colors"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      color: "var(--muted)",
                    }}
                  >
                    <Icon size={15} strokeWidth={1.8} />
                  </button>
                ))}
              </div>

              {/* Write / Preview toggle */}
              <div
                className="flex"
                style={{
                  padding: 3,
                  gap: 2,
                  flexShrink: 0,
                  borderRadius: 9999,
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPreviewing(false)}
                  className="flex items-center font-medium transition-all"
                  style={{
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 9999,
                    fontSize: 12,
                    background: !previewing ? "var(--accent)" : "transparent",
                    color: !previewing ? "#fff" : "var(--muted)",
                  }}
                >
                  <Pencil size={11} strokeWidth={2} />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewing(true)}
                  className="flex items-center font-medium transition-all"
                  style={{
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 9999,
                    fontSize: 12,
                    background: previewing ? "var(--accent)" : "transparent",
                    color: previewing ? "#fff" : "var(--muted)",
                  }}
                >
                  <Eye size={11} strokeWidth={2} />
                  Preview
                </button>
              </div>
            </div>

            {/* Write mode: textarea */}
            {!previewing && (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full resize-none leading-relaxed font-mono placeholder:text-[var(--muted-2)]"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "var(--foreground)",
                }}
                placeholder="What's on your mind?"
              />
            )}

            {/* Preview mode: rendered markdown */}
            {previewing && (
              <div
                style={{ minHeight: 200, overflowWrap: "anywhere", fontSize: 15, color: "var(--foreground)" }}
              >
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p style={{ fontStyle: "italic", color: "var(--muted)", fontSize: 14 }}>
                    Nothing to preview yet — switch to Write and add some content.
                  </p>
                )}
              </div>
            )}

            {/* Char count */}
            <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
              <span />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{title.length}/200</span>
            </div>
          </>
        )}

        {/* ── IMAGE: file picker + URL input + preview ── */}
        {postType === "image" && (
          <>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => imageFileRef.current?.click()}
                disabled={imageUploading}
                className="inline-flex items-center font-medium border transition shrink-0"
                style={{ gap: 8, height: 40, padding: "0 18px", borderRadius: 9999, fontSize: 14, borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface-3)", cursor: imageUploading ? "wait" : "pointer" }}
              >
                <Image size={15} />
                {imageUploading ? "Uploading…" : "Choose photo"}
              </button>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImageUploading(true);
                  setImgError(false);
                  const fd = new FormData();
                  fd.append("file", f);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  setImageUploading(false);
                  if (res.ok) { const { url } = await res.json(); setImageUrl(url); }
                  else setErr("Upload failed");
                }}
              />
              <input
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }}
                className="input font-mono flex-1"
                style={{ fontSize: 13 }}
                placeholder="or paste a direct image URL"
              />
            </div>
            {imageUrl && !imgError && (
              <div style={{ marginBottom: 14, background: "var(--card)", borderRadius: 16, overflow: "hidden" }}>
                <img
                  src={imageUrl}
                  alt="preview"
                  onError={() => setImgError(true)}
                  style={{ width: "100%", maxHeight: 360, objectFit: "contain", display: "block" }}
                />
              </div>
            )}
            {imgError && (
              <p style={{ marginBottom: 14, color: "var(--red)", fontSize: 13 }}>
                Could not load image — check the URL.
              </p>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full resize-none leading-relaxed placeholder:text-[var(--muted-2)]"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "var(--foreground)",
              }}
              placeholder="Caption (optional)"
            />
          </>
        )}

        {/* ── MUSIC: URL input + Spotify embed preview ── */}
        {postType === "music" && (
          <>
            <input
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="input font-mono w-full"
              style={{ marginBottom: 14, fontSize: 14 }}
              placeholder="Paste a Spotify track, album, or playlist URL"
            />
            {spotifyEmbed && (
              <div style={{ marginBottom: 14, borderRadius: 16, overflow: "hidden" }}>
                <iframe
                  src={spotifyEmbed}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  style={{ display: "block", borderRadius: 16 }}
                />
              </div>
            )}
            {musicUrl && !spotifyEmbed && (
              <p style={{ marginBottom: 14, color: "var(--muted)", fontSize: 13 }}>
                Paste a Spotify URL to see a preview.
              </p>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full resize-none leading-relaxed placeholder:text-[var(--muted-2)]"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "var(--foreground)",
              }}
              placeholder="What do you think of this track? (optional)"
            />
          </>
        )}
      </Card>

      {/* ── Options card ── */}
      <Card>
        {/* Space picker */}
        {communities.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Space</SectionLabel>
            <div className="flex" style={{ gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              <button
                type="button"
                onClick={() => selectCommunity("", "")}
                className="shrink-0 font-semibold border transition-all"
                style={{
                  padding: "6px 16px",
                  fontSize: 13,
                  borderRadius: 9999,
                  borderColor: communitySlug === "" ? "rgba(255,255,255,0.5)" : "var(--border)",
                  background: communitySlug === "" ? "rgba(255,255,255,0.12)" : "transparent",
                  color: communitySlug === "" ? "var(--foreground)" : "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                No community
              </button>
              {communities.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => selectCommunity(c.slug, c.id)}
                  className="shrink-0 font-semibold border transition-all"
                  style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    borderRadius: 9999,
                    borderColor: communitySlug === c.slug ? "var(--accent)" : "var(--border)",
                    background: communitySlug === c.slug ? "var(--accent-soft)" : "transparent",
                    color: communitySlug === c.slug ? "var(--accent)" : "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  s/{c.slug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mark picker — shown when a space is selected and has marks */}
        {communitySlug && flairs.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Mark</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {/* No flair option */}
              <button
                type="button"
                onClick={() => setSelectedFlairId("")}
                style={{
                  padding: "4px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: selectedFlairId === "" ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: selectedFlairId === "" ? "var(--accent-soft)" : "transparent",
                  color: selectedFlairId === "" ? "var(--accent)" : "var(--muted)",
                  transition: "all 0.15s",
                }}
              >
                None
              </button>
              {flairs.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFlairId(f.id)}
                  style={{
                    padding: "4px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: selectedFlairId === f.id ? `1px solid ${f.color}` : `1px solid ${f.color}44`,
                    background: selectedFlairId === f.id ? `${f.color}22` : "transparent",
                    color: f.color,
                    transition: "all 0.15s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {selectedFlairId === f.id && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: f.color,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {err && (
          <p style={{ marginBottom: 16, color: "var(--red)", fontSize: 14 }}>{err}</p>
        )}

        <div className="flex items-center justify-between">
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {communitySlug ? `Posting to s/${communitySlug}` : "Posting to your profile"}
          </span>
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="flex items-center justify-center font-semibold transition-opacity"
            style={{
              height: 48,
              paddingLeft: 36,
              paddingRight: 36,
              fontSize: 15,
              borderRadius: 9999,
              background: "var(--accent)",
              color: "#fff",
              opacity: busy || !title.trim() ? 0.4 : 1,
              cursor: busy || !title.trim() ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </Card>
    </form>
  );
}
