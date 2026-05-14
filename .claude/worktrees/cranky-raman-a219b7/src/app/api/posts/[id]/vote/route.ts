import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardBadge } from "@/lib/badges";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { value } = await req.json(); // 1, -1, or 0 (clear)
  const userId = session.user.id;

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId, postId: id } },
  });

  if (value === 0) {
    if (existing) await prisma.vote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.vote.create({ data: { userId, postId: id, value } });
  }

  const score = await prisma.vote.aggregate({
    where: { postId: id },
    _sum: { value: true },
  });

  // popular badge: post hits 100 score
  if ((score._sum.value ?? 0) >= 100) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (post) await awardBadge(post.authorId, "popular");
  }

  return NextResponse.json({ score: score._sum.value ?? 0 });
}
