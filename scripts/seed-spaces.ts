/**
 * Seed starter spaces for Vocalize.
 * Run once: npx tsx scripts/seed-spaces.ts
 */

import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const SPACES = [
  {
    slug: "general",
    name: "General",
    description: "The open floor. Talk about anything — no topic required.",
    themeColor: "#a855f7",
  },
  {
    slug: "music",
    name: "Music",
    description: "Tracks, albums, artists, live shows. All things music.",
    themeColor: "#ec4899",
  },
  {
    slug: "tech",
    name: "Tech",
    description: "Software, hardware, the internet, and everything in between.",
    themeColor: "#3b82f6",
  },
  {
    slug: "art",
    name: "Art",
    description: "Visual art, design, illustration, photography, and creative work.",
    themeColor: "#f59e0b",
  },
  {
    slug: "gaming",
    name: "Gaming",
    description: "Games, players, and the culture around them.",
    themeColor: "#10b981",
  },
];

async function main() {
  console.log("🌱 Seeding starter spaces...\n");

  // Create or retrieve the moderation system account
  const modUser = await prisma.user.upsert({
    where: { username: "vocalize" },
    update: {},
    create: {
      username: "vocalize",
      email: "moderation@vocalize.app",
      // Non-loginable — random irreversible hash
      passwordHash: createHash("sha256")
        .update(Math.random().toString() + Date.now())
        .digest("hex"),
      displayName: "Vocalize",
      bio: "Official Vocalize spaces. Maintained by the platform.",
      accentColor: "#a855f7",
      themeColor: "#a855f7",
    },
  });

  console.log(`✓ Moderation account: @${modUser.username} (${modUser.id})\n`);

  for (const space of SPACES) {
    const community = await prisma.community.upsert({
      where: { slug: space.slug },
      update: {
        name: space.name,
        description: space.description,
        themeColor: space.themeColor,
      },
      create: {
        slug: space.slug,
        name: space.name,
        description: space.description,
        themeColor: space.themeColor,
        ownerId: modUser.id,
      },
    });

    // Make the mod account an owner-role member too
    await prisma.communityMember.upsert({
      where: {
        userId_communityId: {
          userId: modUser.id,
          communityId: community.id,
        },
      },
      update: {},
      create: {
        userId: modUser.id,
        communityId: community.id,
        role: "owner",
      },
    });

    console.log(`✓ s/${community.slug} — ${community.name}`);
  }

  console.log("\n✅ Done. Starter spaces are live.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
