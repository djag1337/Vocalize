import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardBadge } from "@/lib/badges";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const community = url.searchParams.get("community");
  const sort = url.searchParams.get("sort") || "new"; // new | top

  const where = community ? { community: { slug: community } } : {};
  const orderBy = sort === "top"
    ? { votes: { _count: "desc" as const } }
    : { createdAt: "desc" as const };

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
      community: { select: { slug: true, name: true, themeColor: true } },
      _count: { select: { comments: true, votes: true } },
      votes: { select: { value: true } },
    },
  });

  const shaped = posts.map(p => ({
    ...p,
    score: p.votes.reduce((s, v) => s + v.value, 0),
    votes: undefined,
  }));

  return NextResponse.json(shaped);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, communitySlug } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  let communityId: string | undefined;
  if (communitySlug) {
    const c = await prisma.community.findUnique({ where: { slug: communitySlug } });
    if (c) communityId = c.id;
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorId: session.user.id,
      communityId,
    },
  });

  // award first-post badge if applicable
  const userPostCount = await prisma.post.count({ where: { authorId: session.user.id } });
  if (userPostCount === 1) await awardBadge(session.user.id, "first-post");

  // night owl badge (post between midnight-5am local)
  const hr = new Date().getHours();
  if (hr >= 0 && hr < 5) await awardBadge(session.user.id, "night-owl");

  return NextResponse.json(post, { status: 201 });
}
