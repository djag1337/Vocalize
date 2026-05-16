import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, username: true, displayName: true, bio: true, avatarUrl: true,
      themeColor: true, accentColor: true, createdAt: true,
      badges: { include: { badge: true } },
      _count: { select: { posts: true, comments: true } },
    },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["displayName", "bio", "avatarUrl", "themeColor", "accentColor", "backgroundColor", "cardColor", "foregroundColor", "mutedColor", "borderColor", "sidebarColor", "fontFamily", "bannerUrl", "displayBadgeId", "nowPlaying"];
  const data: Record<string, string | null> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) {
      // Treat empty string as null for nullable relation fields
      if (k === "displayBadgeId") {
        data[k] = body[k] === "" ? null : body[k];
      } else {
        data[k] = body[k];
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });
  return NextResponse.json(user);
}
