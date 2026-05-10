import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, username: true, displayName: true } },
      _count: { select: { posts: true, members: true } },
    },
  });
  if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(community);
}
