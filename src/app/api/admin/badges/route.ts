import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_USERNAME = "djagdev";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.name?.toLowerCase() !== ADMIN_USERNAME) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { action: string; userId: string; badgeSlugOrId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, userId, badgeSlugOrId } = body;

  if (!action || !userId || !badgeSlugOrId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Resolve badge
  const badge = await prisma.badge.findFirst({
    where: { OR: [{ id: badgeSlugOrId }, { slug: badgeSlugOrId }] },
  });
  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "award") {
    try {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
    } catch (e: unknown) {
      // P2002 = unique constraint violation — badge already awarded
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        return NextResponse.json({ error: "Badge already awarded" }, { status: 409 });
      }
      throw e;
    }
    return NextResponse.json({ ok: true, action: "awarded", badge });
  }

  if (action === "revoke") {
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (!existing) {
      return NextResponse.json({ error: "User does not have this badge" }, { status: 404 });
    }
    await prisma.userBadge.delete({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    return NextResponse.json({ ok: true, action: "revoked", badge });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
