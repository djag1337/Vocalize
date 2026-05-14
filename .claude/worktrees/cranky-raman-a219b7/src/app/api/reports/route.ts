import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { postId, commentId, reason, details } = await req.json();
  if (!reason) return NextResponse.json({ error: "reason required" }, { status: 400 });

  let communityId: string | null = null;
  if (postId) {
    const p = await prisma.post.findUnique({ where: { id: postId }, select: { communityId: true } });
    communityId = p?.communityId ?? null;
  } else if (commentId) {
    const c = await prisma.comment.findUnique({ where: { id: commentId }, select: { post: { select: { communityId: true } } } });
    communityId = c?.post?.communityId ?? null;
  }

  const r = await prisma.report.create({
    data: {
      reporterId: session.user.id,
      postId: postId || null,
      commentId: commentId || null,
      communityId,
      reason,
      details: details || null,
    },
  });
  return NextResponse.json({ ok: true, report: r });
}
