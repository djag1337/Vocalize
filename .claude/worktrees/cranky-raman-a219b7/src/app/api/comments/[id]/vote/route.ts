import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { value } = await req.json();
  const userId = session.user.id;

  const existing = await prisma.vote.findUnique({
    where: { userId_commentId: { userId, commentId: id } },
  });

  if (value === 0) {
    if (existing) await prisma.vote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.vote.create({ data: { userId, commentId: id, value } });
  }

  const score = await prisma.vote.aggregate({ where: { commentId: id }, _sum: { value: true } });
  return NextResponse.json({ score: score._sum.value ?? 0 });
}
