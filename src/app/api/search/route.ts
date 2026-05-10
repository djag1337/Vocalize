import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ posts: [], communities: [], users: [] });

  const [posts, communities, users] = await Promise.all([
    prisma.post.findMany({
      where: { removed: false, OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { username: true } }, community: { select: { slug: true, themeColor: true } } },
    }),
    prisma.community.findMany({
      where: { OR: [{ slug: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      take: 10,
      include: { _count: { select: { members: true } } },
    }),
    prisma.user.findMany({
      where: { OR: [{ username: { contains: q, mode: "insensitive" } }, { displayName: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { username: true, displayName: true, accentColor: true, bio: true },
    }),
  ]);

  return NextResponse.json({ posts, communities, users });
}
