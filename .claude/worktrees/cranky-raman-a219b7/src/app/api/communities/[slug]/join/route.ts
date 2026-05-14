import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
  });

  if (existing) {
    await prisma.communityMember.delete({ where: { id: existing.id } });
    return NextResponse.json({ joined: false });
  }

  await prisma.communityMember.create({
    data: { userId: session.user.id, communityId: community.id },
  });
  return NextResponse.json({ joined: true });
}
