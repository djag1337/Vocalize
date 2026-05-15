import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_USERNAME = "djagdev";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.name?.toLowerCase() !== ADMIN_USERNAME) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true,
    },
    orderBy: { awardedAt: "desc" },
  });

  return NextResponse.json({
    badges: userBadges.map((ub) => ({
      badge: ub.badge,
      awardedAt: ub.awardedAt.toISOString(),
    })),
  });
}
