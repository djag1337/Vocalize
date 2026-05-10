import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { communityId, name, color } = await req.json();
  if (!communityId || !name) return NextResponse.json({ error: "missing" }, { status: 400 });
  const m = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId } },
  });
  if (m?.role !== "mod" && m?.role !== "owner") {
    return NextResponse.json({ error: "not a mod" }, { status: 403 });
  }
  const f = await prisma.flair.create({ data: { communityId, name, color: color || "#a855f7" } });
  return NextResponse.json({ flair: f });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const communityId = searchParams.get("communityId");
  if (!communityId) return NextResponse.json({ flairs: [] });
  const flairs = await prisma.flair.findMany({ where: { communityId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ flairs });
}
