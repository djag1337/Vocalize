import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  return NextResponse.json({ ...post, score, votes: undefined });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { title, content } = await req.json();
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post || post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updated = await prisma.post.update({ where: { id }, data: { title, content } });
  return NextResponse.json(updated);
}
