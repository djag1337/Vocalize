import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });
  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }
  await prisma.savedPost.create({ data: { userId: session.user.id, postId } });
  return NextResponse.json({ saved: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const saves = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: { username: true, displayName: true, accentColor: true } },
          community: { select: { slug: true, name: true, themeColor: true } },
          flair: { select: { name: true, color: true } },
          _count: { select: { comments: true } },
          votes: { select: { value: true, userId: true } },
        },
      },
    },
  });
  return NextResponse.json({ saves });
}
