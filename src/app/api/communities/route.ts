import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { posts: true, members: true } } },
  });
  return NextResponse.json(communities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, name, description, themeColor } = await req.json();
  if (!slug?.trim() || !name?.trim()) return NextResponse.json({ error: "Slug and name required" }, { status: 400 });

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!cleanSlug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const exists = await prisma.community.findUnique({ where: { slug: cleanSlug } });
  if (exists) return NextResponse.json({ error: "Community already exists" }, { status: 409 });

  const community = await prisma.community.create({
    data: {
      slug: cleanSlug,
      name: name.trim(),
      description: description?.trim() || null,
      themeColor: themeColor || "#a855f7",
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: "owner" } },
    },
  });

  return NextResponse.json(community, { status: 201 });
}
