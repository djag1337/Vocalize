"use client";
import { useEffect, useState, useCallback } from "react";
import { X, Heart, MessageCircle, Send, ExternalLink } from "lucide-react";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer";

type PostData = {
  id: string;
  title: string;
  content: string;
  postType?: string;
  imageUrl?: string | null;
  musicUrl?: string | null;
  createdAt: string;
  score: number;
  myVote?: number;
  author: { id: string; username: string; displayName?: string | null; accentColor?: string | null };
  community?: { slug: string; name: string; themeColor?: string | null } | null;
  _count: { comments: number };
};

type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  score: number;
  author: { username: string; displayName?: string | null; accentColor?: string | null };
};

function timeAgo(d: string) {
  const date = new Date(d);
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return date.toLocaleDateString();
}

export default function PostModal() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [score, setScore] = useState(0);
  const [myVote, setMyVote] = useState(0);
  const [commentPreviewing, setCommentPreviewing] = useState(false);

  const close = useCallback(() => {
    setOpenId(null);
    setPost(null);
    setComments([]);
    setNewComment("");
    setCommentPreviewing(false);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    function handler(e: Event) {
      const id = (e as CustomEvent).detail?.id;
      if (id) {
        setOpenId(id);
        history.replaceState(null, "", `/p/${id}`);
      }
    }
    window.addEventListener("openPostModal", handler);
    return () => window.removeEventListener("openPostModal", handler);
  }, []);

  useEffect(() => {
    if (!openId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/posts/${openId}`).then(r => r.json()),
      fetch(`/api/posts/${openId}/comments`).then(r => r.json()),
    ])
      .then(([p, c]) => {
        setPost(p);
        setScore(p.score ?? 0);
        setMyVote(p.myVote ?? 0);
        setComments(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, [openId]);

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openId, close]);

  async function toggleLike() {
    if (!openId) return;
    const newVote = myVote === 1 ? 0 : 1;
    setScore(s => s - myVote + newVote);
    setMyVote(newVote);
    try {
      await fetch(`/api/posts/${openId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newVote }),
      });
    } catch {}
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !openId) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/posts/${openId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(prev => [...prev, { ...c, score: 0 }]);
        setNewComment("");
      }
    } finally {
      setPosting(false);
    }
  }

  if (!openId) return null;

  const accent = post?.author.accentColor ?? null;
  const avatarGradient = accent
    ? `linear-gradient(135deg, ${accent}88, ${accent})`
    : "linear-gradient(135deg, var(--accent-2), var(--accent))";

  return (
    /* ── Backdrop ── */
    <div
      className="post-modal-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "5vh", paddingLeft: 16, paddingRight: 16,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      onClick={close}
    >
      {/* ── Modal shell ── */}
      <div
        className="post-modal-shell"
        style={{
          background: "var(--surface-3)",
          border: "1px solid var(--border)",
          borderRadius: 28,
          width: "100%", maxWidth: 672,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: "0 8px 48px rgba(0,0,0,0.72), 0 2px 8px rgba(0,0,0,0.4)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "15px 20px 14px 26px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {post?.community ? `s/${post.community.slug}` : "Post"}
          </span>
          <button
            onClick={close}
            style={{
              width: 32, height: 32, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--muted)", background: "transparent",
              border: "none", cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading || !post ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontSize: 15 }}>
              Loading…
            </div>
          ) : (
            <>
              {/* ── Post content ── */}
              <div className="post-modal-body" style={{ padding: "28px 32px 20px 32px" }}>
                {/* Author row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: avatarGradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: 15, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {(post.author.displayName || post.author.username)[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", lineHeight: "22px" }}>
                      <Link
                        href={`/u/${post.author.username}`}
                        style={{ fontWeight: 600, fontSize: 16, color: "var(--foreground)", textDecoration: "none" }}
                      >
                        {post.author.displayName || post.author.username}
                      </Link>
                      <span style={{ fontSize: 14, color: "var(--muted)" }}>@{post.author.username}</span>
                      <span style={{ color: "var(--muted)", fontSize: 14 }}>·</span>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>{timeAgo(post.createdAt)}</span>
                    </div>
                    {post.community && (
                      <Link
                        href={`/c/${post.community.slug}`}
                        style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
                      >
                        s/{post.community.slug}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Title + body — inset to align with author text */}
                <div className="post-modal-content-indent" style={{ paddingLeft: 56 }}>
                  <h1
                    style={{
                      fontSize: 20, fontWeight: 700, lineHeight: 1.3,
                      color: "var(--foreground)", marginBottom: 8,
                    }}
                  >
                    {post.title}
                  </h1>
                  {post.content && (
                    <div style={{ fontSize: 15, color: "var(--foreground)", lineHeight: 1.6 }}>
                      <MarkdownRenderer content={post.content} />
                    </div>
                  )}
                  {/* Image */}
                  {post.postType === "image" && post.imageUrl && (
                    <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12 }}>
                      <img
                        src={post.imageUrl}
                        alt=""
                        style={{ width: "100%", maxHeight: 480, objectFit: "contain", display: "block", background: "var(--card)" }}
                      />
                    </div>
                  )}
                  {/* Music */}
                  {post.postType === "music" && post.musicUrl && (() => {
                    const m = post.musicUrl.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
                    if (!m) return null;
                    const embedUrl = `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
                    return (
                      <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12 }}>
                        <iframe
                          src={embedUrl}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          style={{ display: "block", borderRadius: 16 }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ── Action pill ── */}
              <div className="post-modal-actions" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 20 }}>
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 24,
                    height: 44, paddingLeft: 24, paddingRight: 24,
                    background: "var(--card-hover)",
                    borderRadius: 9999,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Applause */}
                  <button
                    onClick={toggleLike}
                    title={myVote === 1 ? "Remove applause" : "Applaud"}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      color: myVote === 1 ? "#FF3040" : "var(--muted)",
                      background: "none", border: "none", cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                  >
                    <Heart size={18} strokeWidth={1.5} fill={myVote === 1 ? "currentColor" : "none"} />
                    {(score !== 0 || myVote === 1) && (
                      <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{score}</span>
                    )}
                  </button>

                  {/* Comment count */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      color: "var(--muted)",
                    }}
                  >
                    <MessageCircle size={18} strokeWidth={1.5} />
                    {comments.length > 0 && (
                      <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{comments.length}</span>
                    )}
                  </div>

                  {/* Open full page */}
                  <Link
                    href={`/p/${openId}`}
                    onClick={close}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 13, color: "var(--muted)", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                  >
                    <ExternalLink size={14} strokeWidth={1.5} />
                    <span>Open</span>
                  </Link>
                </div>
              </div>

              {/* ── Comment input ── */}
              <div className="post-modal-actions" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 20 }}>
                <form
                  onSubmit={submitComment}
                  style={{
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    padding: "14px 14px 14px 18px",
                    display: "flex", flexDirection: "column", gap: 10,
                  }}
                >
                  {commentPreviewing ? (
                    <div
                      style={{
                        minHeight: 44, paddingTop: 2,
                        fontSize: 15, color: "var(--foreground)", lineHeight: 1.6,
                      }}
                    >
                      {newComment.trim() ? (
                        <MarkdownRenderer content={newComment} />
                      ) : (
                        <span style={{ color: "var(--muted)" }}>Nothing to preview</span>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          submitComment(e as unknown as React.FormEvent);
                        }
                      }}
                      placeholder="Write a reply…"
                      rows={2}
                      style={{
                        flex: 1, background: "transparent",
                        fontSize: 15, color: "var(--foreground)",
                        outline: "none", resize: "none", lineHeight: 1.6,
                        minHeight: 44, maxHeight: 120,
                        border: "none", fontFamily: "inherit",
                      }}
                    />
                  )}

                  {/* Bottom row: preview toggle + send */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                    <button
                      type="button"
                      onClick={() => setCommentPreviewing(p => !p)}
                      style={{
                        fontSize: 12, fontWeight: 500, cursor: "pointer",
                        color: commentPreviewing ? "var(--foreground)" : "var(--muted)",
                        background: commentPreviewing ? "var(--surface-2)" : "transparent",
                        borderRadius: 8, padding: "3px 10px",
                        border: "1px solid var(--border)",
                        transition: "color 0.15s, background 0.15s",
                      }}
                    >
                      {commentPreviewing ? "Edit" : "Preview"}
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || posting}
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--foreground)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        opacity: (!newComment.trim() || posting) ? 0.25 : 1,
                        cursor: "pointer", border: "none",
                        transition: "opacity 0.15s",
                      }}
                      title="Send reply (⌘↵)"
                    >
                      <Send size={15} style={{ color: "var(--background)", marginLeft: 1 }} />
                    </button>
                  </div>
                </form>
              </div>

              {/* ── Comments ── */}
              <div className="post-modal-actions" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 32 }}>
                {/* Section label */}
                <p
                  style={{
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "var(--muted)", marginBottom: 12,
                  }}
                >
                  Replies
                </p>

                {comments.length === 0 ? (
                  <div
                    style={{
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      borderRadius: 24,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                      padding: "40px 24px",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: 28, marginBottom: 10 }}>💬</span>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
                      Be the first to reply
                    </p>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                      Share your thoughts on this post.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {comments.map(c => {
                      const cAccent = c.author.accentColor ?? null;
                      const cGradient = cAccent
                        ? `linear-gradient(135deg, ${cAccent}88, ${cAccent})`
                        : "linear-gradient(135deg, var(--accent-2), var(--accent))";
                      return (
                        <div
                          key={c.id}
                          style={{
                            background: "var(--surface-3)",
                            border: "1px solid var(--border)",
                            borderRadius: 24,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                            padding: "16px 18px",
                            display: "flex", gap: 12,
                          }}
                        >
                          {/* Comment avatar — gradient */}
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: cGradient,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontSize: 12, fontWeight: 700,
                              flexShrink: 0, marginTop: 1,
                            }}
                          >
                            {(c.author.displayName || c.author.username)[0]?.toUpperCase()}
                          </div>

                          {/* Comment content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Link
                                href={`/u/${c.author.username}`}
                                style={{
                                  fontSize: 13, fontWeight: 700,
                                  color: cAccent ?? "var(--foreground)",
                                  textDecoration: "none",
                                }}
                              >
                                {c.author.displayName || c.author.username}
                              </Link>
                              <span style={{ color: "var(--muted)", fontSize: 13 }}>·</span>
                              <span style={{ fontSize: 13, color: "var(--muted)" }}>{timeAgo(c.createdAt)}</span>
                            </div>
                            <div style={{ fontSize: 14, color: "var(--foreground)", marginTop: 4, lineHeight: 1.5 }}>
                              <MarkdownRenderer content={c.content} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
