import { prisma } from "./prisma";

export async function awardBadge(userId: string, badgeSlug: string) {
  const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
  if (!badge) return null;

  try {
    return await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });
  } catch {
    // already has it
    return null;
  }
}

export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });
}
