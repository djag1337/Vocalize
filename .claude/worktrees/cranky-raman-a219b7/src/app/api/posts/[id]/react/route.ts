import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { emoji } = await req.json();
  if (!emoji) return NextResponse.json({ error: "No emoji" }, { status: 400 });

  const existing = await prisma.reaction.findUnique({
    where: { userId_postId_emoji: { userId: session.user.id, postId: id, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  } else {
    await prisma.reaction.create({ data: { userId: session.user.id, postId: id, emoji } });
    return NextResponse.json({ action: "added" });
  }
}
