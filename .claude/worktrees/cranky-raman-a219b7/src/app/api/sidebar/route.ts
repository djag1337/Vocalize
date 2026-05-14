import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [trending, recentPosts] = await Promise.all([
    prisma.community.findMany({
      take: 5,
      orderBy: { members: { _count: "desc" } },
      select: {
        id: true, slug: true, name: true, themeColor: true,
        _count: { select: { members: true, posts: true } },
      },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { removed: false },
      select: { id: true, title: true, author: { select: { username: true } } },
    }),
  ]);
  return NextResponse.json({ trending, recentPosts });
}
