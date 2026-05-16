import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardBadge } from "@/lib/badges";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
      votes: { select: { value: true, userId: true } },
    },
  });
  const shaped = comments.map(c => ({
    ...c,
    score: c.votes.reduce((s, v) => s + v.value, 0),
  }));
  return NextResponse.json(shaped);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, parentId } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, locked: true, title: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.locked) return NextResponse.json({ error: "Post is locked" }, { status: 403 });

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId: id,
      authorId: session.user.id,
      parentId: parentId || null,
    },
    include: { author: { select: { username: true } } },
  });

  // Notify post author (if not self)
  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        recipientId: post.authorId,
        actorId: session.user.id,
        type: "reply",
        postId: id,
        commentId: comment.id,
        message: `commented on your post "${post.title.slice(0, 60)}"`,
      },
    });
  }

  // If reply to a comment, notify that comment's author too
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { authorId: true } });
    if (parent && parent.authorId !== session.user.id && parent.authorId !== post.authorId) {
      await prisma.notification.create({
        data: {
          recipientId: parent.authorId,
          actorId: session.user.id,
          type: "reply",
          postId: id,
          commentId: comment.id,
          message: `replied to your comment`,
        },
      });
    }
  }

  // &mention notifications
  const mentions = (content.match(/&([a-zA-Z0-9_]+)/g) || []).map((m: string) => m.slice(1).toLowerCase());
  if (mentions.length) {
    const mentioned = await prisma.user.findMany({ where: { username: { in: mentions, mode: "insensitive" } }, select: { id: true } });
    for (const u of mentioned) {
      if (u.id === session.user.id) continue;
      await prisma.notification.create({
        data: {
          recipientId: u.id,
          actorId: session.user.id,
          type: "mention",
          postId: id,
          commentId: comment.id,
          message: `mentioned you`,
        },
      });
    }
  }

  const cnt = await prisma.comment.count({ where: { authorId: session.user.id } });
  if (cnt === 1) await awardBadge(session.user.id, "first-comment");

  return NextResponse.json(comment, { status: 201 });
}
