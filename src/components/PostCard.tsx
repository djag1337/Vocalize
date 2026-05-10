"use client";
import Link from "next/link";
import Avatar from "./Avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Bookmark, BookmarkCheck, Pin, Lock, Flag, Share2, Pencil } from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

type Props = {
  post: {
    id: string;
    title: string;
    content: string;
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
  const [saved, setSaved] = useState(post.saved ?? false);
  const [reactions, setReactions] = useState<{ emoji: string; userId: string }[]>(post.reactions ?? []);
  const [copied, setCopied] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editSaving, setEditSaving] = useState(false);

  // Display values (may be updated after edit)
  const [displayTitle, setDisplayTitle] = useState(post.title);
  const [displayContent, setDisplayContent] = useState(post.content);

  async function vote(v: number) {
    const newVote = myVote === v ? 0 : v;
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
    setSaved(!saved);
    await fetch(`/api/saves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    });
  }

  async function react(emoji: string) {
    const alreadyReacted = reactions.some(
      (r) => r.emoji === emoji && r.userId === (myUserId ?? "")
    );
    if (alreadyReacted) {
      setReactions(reactions.filter((r) => !(r.emoji === emoji && r.userId === (myUserId ?? ""))));
    } else {
      setReactions([...reactions, { emoji, userId: myUserId ?? "" }]);
    }
    try {
      await fetch(`/api/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      setReactions(post.reactions ?? []);
    }
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

  const isAuthor = myUserId && post.author.id && myUserId === post.author.id;
  const avatarSize = density === "compact" ? 28 : 38;
  const accentColor = post.author.accentColor;

  return (
    <article
      onClick={() => !editing && router.push(`/p/${post.id}`)}
      className="px-4 py-4 border-b border-[var(--border)] hover:bg-[var(--surface)]/30 cursor-pointer transition-colors fade-in"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link
          href={`/u/${post.author.username}`}
          onClick={e => e.stopPropagation()}
          className="hover:opacity-90 shrink-0"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <span
            className="avatar"
            style={{
              width: avatarSize,
              height: avatarSize,
              fontSize: density === "compact" ? 11 : 14,
              background: accentColor
                ? `linear-gradient(135deg, ${accentColor}88, ${accentColor})`
                : undefined,
            }}
          >
            {(post.author.displayName || post.author.username)[0]?.toUpperCase()}
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] flex-wrap">
            <Link
              href={`/u/${post.author.username}`}
              onClick={e => e.stopPropagation()}
              className="font-semibold text-[var(--foreground)] hover:underline"
            >
              {post.author.displayName || post.author.username}
            </Link>
            {post.author.displayBadge && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: `${post.author.displayBadge.color}26`,
                  color: post.author.displayBadge.color,
                }}
              >
                <span>{post.author.displayBadge.icon}</span>
                {density !== "compact" && <span>{post.author.displayBadge.name}</span>}
              </span>
            )}
            <span className="text-[var(--muted-2)]">@{post.author.username}</span>
            {post.community && (
              <>
                <span>·</span>
                <Link
                  href={`/c/${post.community.slug}`}
                  onClick={e => e.stopPropagation()}
                  className="hover:underline font-medium"
                  style={{ color: post.community.themeColor || "var(--accent)" }}
                >
                  c/{post.community.slug}
                </Link>
              </>
            )}
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.pinned && (
              <span title="Pinned" className="inline-flex items-center text-[var(--accent)]">
                <Pin size={13} strokeWidth={2.2} />
              </span>
            )}
            {post.locked && (
              <span title="Locked" className="inline-flex items-center text-[var(--muted)]">
                <Lock size={13} strokeWidth={2.2} />
              </span>
            )}
            {post.flair && (
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: `${post.flair.color}25`, color: post.flair.color }}
              >
                {post.flair.name}
              </span>
            )}
          </div>

          {/* Title + content (editable when editing) */}
          {editing ? (
            <div onClick={e => e.stopPropagation()} className="mt-2 space-y-2">
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="input text-[15px] font-semibold"
                onClick={e => e.stopPropagation()}
              />
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={4}
                className="input text-[14px] resize-none"
                onClick={e => e.stopPropagation()}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={editSaving}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  {editSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="btn-ghost text-xs px-4 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-[17px] font-semibold mt-2 leading-snug text-[var(--foreground)]">
                {displayTitle}
              </h2>
              {density !== "compact" && displayContent && (
                <p className="text-[15px] text-[var(--muted)] mt-1.5 leading-relaxed clamp-3">
                  {displayContent}
                </p>
              )}
            </>
          )}

          {/* Action row */}
          <div
            className="flex items-center gap-1 mt-3 -ml-1.5 text-[var(--muted)] flex-wrap"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => vote(1)}
              aria-label="upvote"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[13px] ${myVote === 1 ? "text-[var(--accent)]" : ""}`}
            >
              <ArrowBigUp size={18} strokeWidth={1.8} fill={myVote === 1 ? "currentColor" : "none"} />
            </button>
            <span
              className={`text-[13px] font-semibold min-w-[16px] text-center ${
                myVote === 1 ? "text-[var(--accent)]" : myVote === -1 ? "text-purple-400" : "text-[var(--foreground)]"
              }`}
            >
              {score}
            </span>
            <button
              onClick={() => vote(-1)}
              aria-label="downvote"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[13px] ${myVote === -1 ? "text-purple-400" : ""}`}
            >
              <ArrowBigDown size={18} strokeWidth={1.8} fill={myVote === -1 ? "currentColor" : "none"} />
            </button>
            <Link
              href={`/p/${post.id}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[13px]"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              <span>{post.commentCount}</span>
            </Link>
            <button
              onClick={toggleSave}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[13px] ${saved ? "text-yellow-400" : ""}`}
            >
              {saved
                ? <BookmarkCheck size={16} strokeWidth={2} fill="currentColor" />
                : <Bookmark size={16} strokeWidth={1.8} />}
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={sharePost}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[13px] ${copied ? "text-[var(--green)]" : ""}`}
            >
              <Share2 size={16} strokeWidth={1.8} />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>
            {isAuthor && !editing && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[13px]"
              >
                <Pencil size={15} strokeWidth={1.8} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button
              onClick={async (e) => {
                e.preventDefault();
                const reason = prompt("Why are you reporting this post? (humans review reports — no AI)");
                if (!reason) return;
                await fetch("/api/reports", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postId: post.id, reason }),
                });
                alert("Report submitted. A human mod will look at it.");
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[var(--surface-3)] hover:text-[var(--red)] transition-colors text-[13px] ml-auto"
              title="Report"
              aria-label="Report"
            >
              <Flag size={16} strokeWidth={1.8} />
            </button>
          </div>

          {/* Reactions row */}
          <div className="flex flex-wrap gap-1 mt-2" onClick={e => e.stopPropagation()}>
            {REACTION_EMOJIS.map((emoji) => {
              const count = reactions.filter((r) => r.emoji === emoji).length;
              const reacted = myUserId
                ? reactions.some((r) => r.emoji === emoji && r.userId === myUserId)
                : false;
              return (
                <button
                  key={emoji}
                  onClick={() => react(emoji)}
                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[12px] border transition-colors ${
                    reacted
                      ? "border-[var(--accent)]/60 bg-[var(--accent-soft)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--surface-3)] hover:bg-[var(--surface-2)] text-[var(--muted)]"
                  }`}
                >
                  <span>{emoji}</span>
                  {count > 0 && (
                    <span className={`text-[11px] font-medium ${reacted ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
