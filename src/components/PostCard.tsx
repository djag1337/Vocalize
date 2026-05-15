"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, MoreHorizontal, Pencil, Flag, Bookmark } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

type Props = {
  post: {
    id: string;
    title: string;
    content: string;
    postType?: string;
    imageUrl?: string | null;
    musicUrl?: string | null;
    createdAt: Date | string;
    pinned?: boolean;
    locked?: boolean;
    author: {
      id?: string;
      username: string;
      accentColor?: string | null;
      displayName?: string | null;
      displayBadge?: { name: string; icon: string; color: string } | null;
    };
    community?: { slug: string; name: string; themeColor?: string | null } | null;
    flair?: { name: string; color: string } | null;
    score: number;
    myVote: number;
    commentCount: number;
    saved?: boolean;
    reactions?: { emoji: string; userId: string }[];
  };
  density?: "comfortable" | "compact" | "card";
  myUserId?: string;
};

function timeAgo(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return date.toLocaleDateString();
}

export default function PostCard({ post, density = "comfortable", myUserId }: Props) {
  const router = useRouter();
  const [score, setScore] = useState(post.score);
  const [myVote, setMyVote] = useState(post.myVote);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(post.saved ?? false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editSaving, setEditSaving] = useState(false);

  // Display values
  const [displayTitle, setDisplayTitle] = useState(post.title);
  const [displayContent, setDisplayContent] = useState(post.content);

  // Report state
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  async function toggleLike() {
    const newVote = myVote === 1 ? 0 : 1;
    setScore(score - myVote + newVote);
    setMyVote(newVote);
    try {
      await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newVote }),
      });
    } catch {}
  }

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    if (next) {
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 700);
    }
    await fetch(`/api/saves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    });
  }

  async function sharePost(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(window.location.origin + "/p/" + post.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function saveEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        setDisplayTitle(editTitle);
        setDisplayContent(editContent);
        setEditing(false);
      }
    } finally {
      setEditSaving(false);
    }
  }

  function cancelEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditTitle(displayTitle);
    setEditContent(displayContent);
    setEditing(false);
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) return;
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, reason: reportReason }),
    });
    setReportSent(true);
    setTimeout(() => {
      setShowReport(false);
      setReportReason("");
      setReportSent(false);
    }, 1500);
  }

  const isAuthor = myUserId && post.author.id && myUserId === post.author.id;
  const accentColor = post.author.accentColor;
  const liked = myVote === 1;

  return (
    <>
      {/* Report modal */}
      {showReport && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 16px",
          }}
          onClick={() => { setShowReport(false); setReportReason(""); }}
        >
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "24px 24px 20px",
              width: "100%", maxWidth: 400,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {reportSent ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <Flag size={22} style={{ color: "var(--accent)", margin: "0 auto 10px" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Reported</p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>A human mod will review this.</p>
              </div>
            ) : (
              <form onSubmit={submitReport}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 16 }}>Report post</p>
                <textarea
                  autoFocus
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="What's wrong with this post?"
                  rows={3}
                  style={{
                    width: "100%", background: "var(--surface-3)",
                    border: "1px solid var(--border)", borderRadius: 12,
                    padding: "10px 14px", fontSize: 14,
                    color: "var(--foreground)", resize: "none",
                    outline: "none", fontFamily: "inherit",
                    marginBottom: 14,
                  }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => { setShowReport(false); setReportReason(""); }}
                    style={{
                      padding: "8px 18px", borderRadius: 10, fontSize: 14,
                      color: "var(--muted)", background: "transparent",
                      border: "1px solid var(--border)", cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason.trim()}
                    style={{
                      padding: "8px 18px", borderRadius: 10, fontSize: 14,
                      fontWeight: 600, color: "#fff",
                      background: "var(--red)",
                      border: "none", cursor: "pointer",
                      opacity: reportReason.trim() ? 1 : 0.4,
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-stretch">
        <article
          onClick={() => !editing && window.dispatchEvent(new CustomEvent("openPostModal", { detail: { id: post.id } }))}
          className="hover:brightness-110 cursor-pointer flex flex-col transition-all post-card-article"
          style={{
            background: 'var(--surface-3)',
            borderRadius: 28,
            boxShadow: '0 6px 32px rgba(0,0,0,0.6)',
          }}
        >
          {/* Author row */}
          <div className="flex items-start post-card-inner" style={{ gap: 16 }}>
            <Link
              href={`/u/${post.author.username}`}
              onClick={e => e.stopPropagation()}
              className="shrink-0"
              style={{ marginTop: 2 }}
            >
              <div
                className="flex items-center justify-center font-bold"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  color: 'white', fontSize: 15,
                  background: accentColor ? `linear-gradient(135deg, ${accentColor}88, ${accentColor})` : "linear-gradient(135deg, var(--accent-2), var(--accent))"
                }}
              >
                {(post.author.displayName || post.author.username)[0]?.toUpperCase()}
              </div>
            </Link>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div className="flex items-center min-w-0" style={{ gap: 8, lineHeight: '22px' }}>
                <Link
                  href={`/u/${post.author.username}`}
                  onClick={e => e.stopPropagation()}
                  className="font-semibold hover:underline truncate"
                  style={{ fontSize: 17, color: 'var(--foreground)' }}
                >
                  {post.author.displayName || post.author.username}
                </Link>
                {post.author.displayBadge && (
                  <span
                    className="inline-flex items-center font-medium shrink-0"
                    style={{ fontSize: 12, color: post.author.displayBadge.color }}
                  >
                    <span>{post.author.displayBadge.icon}</span>
                  </span>
                )}
                <span className="truncate" style={{ fontSize: 15, color: 'var(--muted)' }}>@{post.author.username}</span>
                <span className="shrink-0" style={{ fontSize: 15, color: 'var(--muted)' }}>&middot;</span>
                <span className="shrink-0" style={{ fontSize: 13, color: 'var(--muted)' }}>{timeAgo(post.createdAt)}</span>
              </div>
              {(post.community || post.flair || post.pinned || post.locked || post.postType === "image" || post.postType === "music") && (
                <div className="flex items-center flex-wrap" style={{ gap: 8, minWidth: 0, marginTop: 2 }}>
                  {post.pinned && (
                    <span className="font-semibold" style={{ fontSize: 12, color: 'var(--accent)' }}>📌 Pinned</span>
                  )}
                  {post.locked && (
                    <span className="font-semibold" style={{ fontSize: 12, color: 'var(--muted)' }}>🔒 Locked</span>
                  )}
                  {post.community && (
                    <Link
                      href={`/c/${post.community.slug}`}
                      onClick={e => e.stopPropagation()}
                      className="hover:underline truncate"
                      style={{ fontSize: 13, color: 'var(--muted)' }}
                    >
                      s/{post.community.slug}
                    </Link>
                  )}
                  {post.flair && (
                    <span
                      className="inline-block font-medium"
                      style={{
                        padding: '0 8px', borderRadius: 9999, fontSize: 12,
                        background: `${post.flair.color}20`, color: post.flair.color,
                      }}
                    >
                      {post.flair.name}
                    </span>
                  )}
                  {post.postType === "image" && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>🖼 Image</span>
                  )}
                  {post.postType === "music" && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>🎵 Music</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="post-card-content" style={{ marginTop: '16px' }}>
            {editing ? (
              <div onClick={e => e.stopPropagation()} className="flex flex-col" style={{ gap: 8 }}>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="input"
                  style={{ fontSize: 15, fontWeight: 600 }}
                  onClick={e => e.stopPropagation()}
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  style={{ fontSize: 15 }}
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex" style={{ gap: 8 }}>
                  <button onClick={saveEdit} disabled={editSaving} className="btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>
                    {editSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={cancelEdit} className="btn-ghost" style={{ fontSize: 13, padding: '8px 20px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-semibold" style={{ fontSize: 17, lineHeight: '22px', color: 'var(--foreground)' }}>
                  {displayTitle}
                </h2>
                {displayContent && (
                  <div style={{ fontSize: 15, color: 'var(--foreground)', marginTop: 4, overflowWrap: "anywhere" }}>
                    <MarkdownRenderer content={displayContent} preview />
                  </div>
                )}
                {post.postType === "image" && post.imageUrl && (
                  <div className="overflow-hidden" style={{ borderRadius: 16, marginTop: 12 }}>
                    <img
                      src={post.imageUrl}
                      alt=""
                      style={{ width: "100%", maxHeight: 400, objectFit: "cover", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                {post.postType === "music" && post.musicUrl && (() => {
                  const m = post.musicUrl.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
                  if (!m) return null;
                  const embedUrl = `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
                  return (
                    <div className="overflow-hidden" style={{ borderRadius: 16, marginTop: 12 }}>
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        style={{ display: "block", borderRadius: 16 }}
                      />
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="post-card-divider" style={{ height: 1, background: "var(--border)", marginTop: 20 }} />

          {/* Action row — lives inside the card */}
          <div
            className="flex items-center"
            style={{ paddingTop: 14, paddingBottom: 18, gap: 24 }}
            onClick={e => e.stopPropagation()}
          >
          {/* Applause */}
          <button
            onClick={toggleLike}
            title={liked ? "Remove applause" : "Applaud"}
            className="flex items-center transition-colors"
            style={{ gap: 6, color: liked ? '#FF3040' : 'var(--muted)' }}
          >
            <Heart size={18} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
            {(score !== 0 || liked) && (
              <span className="tabular-nums" style={{ fontSize: 13, color: liked ? '#FF3040' : 'var(--muted)' }}>
                {score}
              </span>
            )}
          </button>

          {/* Comment */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openPostModal", { detail: { id: post.id } }))}
            className="flex items-center transition-colors"
            style={{ gap: 6, color: 'var(--muted)' }}
          >
            <MessageCircle size={18} strokeWidth={1.5} />
            {post.commentCount > 0 && (
              <span className="tabular-nums" style={{ fontSize: 13, color: 'var(--muted)' }}>
                {post.commentCount}
              </span>
            )}
          </button>

          {/* Save */}
          <button
            onClick={toggleSave}
            className="flex items-center transition-colors"
            style={{
              gap: 6,
              color: saved ? "var(--accent)" : "var(--muted)",
              transform: saveFlash ? "scale(1.3)" : "scale(1)",
              transition: "color 0.15s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <Bookmark size={18} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
          </button>

          {/* Share */}
          <button
            onClick={sharePost}
            className="flex items-center transition-colors"
            style={{ color: copied ? '#00BA7C' : 'var(--muted)' }}
          >
            <Send size={18} strokeWidth={1.5} />
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
              className="flex items-center transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              <MoreHorizontal size={18} strokeWidth={1.5} />
            </button>
            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(100% + 6px)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  padding: "4px 0",
                  minWidth: 148,
                  zIndex: 20,
                }}
              >
                {isAuthor && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); setShowMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 16px",
                      fontSize: 14,
                      color: "var(--foreground)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Pencil size={15} strokeWidth={1.5} /> Edit
                  </button>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); setShowReport(true); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: 14,
                    color: "var(--red)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Flag size={15} strokeWidth={1.5} /> Report
                </button>
              </div>
            )}
          </div>
          </div>
        </article>
      </div>
    </>
  );
}
