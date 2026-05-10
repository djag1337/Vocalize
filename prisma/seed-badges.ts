import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const BADGES = [
  { slug: "founder", name: "Founder", description: "Built Vocalize from the ground up.", icon: "👑", color: "#fbbf24", rarity: "legendary" },
  { slug: "early-adopter", name: "Early Adopter", description: "Joined in the first wave.", icon: "🌱", color: "#22c55e", rarity: "epic" },
  { slug: "verified", name: "Verified", description: "Identity confirmed.", icon: "✅", color: "#3b82f6", rarity: "rare" },
  { slug: "og", name: "OG", description: "Day-one user.", icon: "💎", color: "#06b6d4", rarity: "legendary" },
  { slug: "moderator", name: "Moderator", description: "Keeps the community clean (the human way).", icon: "🛡️", color: "#a855f7", rarity: "epic" },
  { slug: "creator", name: "Creator", description: "Posts content people love.", icon: "🎨", color: "#ec4899", rarity: "rare" },
  { slug: "voice", name: "Voice", description: "Speaks up. People listen.", icon: "🎙️", color: "#f97316", rarity: "rare" },
  { slug: "supporter", name: "Supporter", description: "Helps keep Vocalize alive.", icon: "💜", color: "#a855f7", rarity: "rare" },
  { slug: "first-post", name: "First Post", description: "Made their first post.", icon: "📝", color: "#94a3b8", rarity: "common" },
  { slug: "first-comment", name: "First Comment", description: "Joined the conversation.", icon: "💬", color: "#94a3b8", rarity: "common" },
  { slug: "popular", name: "Popular", description: "A post hit 100 upvotes.", icon: "🔥", color: "#ef4444", rarity: "epic" },
  { slug: "night-owl", name: "Night Owl", description: "Posts after midnight.", icon: "🦉", color: "#6366f1", rarity: "common" },
];

async function main() {
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
  }
  console.log(`✅ Seeded ${BADGES.length} badges`);
}

main().finally(() => prisma.$disconnect());
