import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
      community: { select: { slug: true, name: true, themeColor: true } },
      votes: { select: { value: true, userId: true } },
      _count: { select: { comments: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const score = post.votes.reduce((s, v) => s + v.value, 0);
  const myVote = session?.user?.id
    ? (post.votes.find(v => v.userId === session.user!.id)?.value ?? 0)
    : 0;
  return NextResponse.json({ ...post, score, myVote, votes: undefined });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { title, content, imageUrl, musicUrl, flairId, modOverride } = body;

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, communityId: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (modOverride && post.communityId) {
    // Verify caller is a mod or owner of the community
    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: session.user.id, communityId: post.communityId } },
    });
    if (member?.role !== "mod" && member?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl ?? null }),
      ...(musicUrl !== undefined && { musicUrl: musicUrl ?? null }),
      ...(flairId !== undefined && { flairId: flairId ?? null }),
    },
  });
  return NextResponse.json(updated);
}
