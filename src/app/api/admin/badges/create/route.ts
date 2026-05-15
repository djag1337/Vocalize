import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_USERNAME = "djagdev";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.name?.toLowerCase() !== ADMIN_USERNAME) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    name: string;
    icon: string;
    color: string;
    rarity: string;
    description: string;
    slug?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, icon, color, rarity, description, slug: rawSlug } = body;

  if (!name || !icon || !color || !rarity || !description) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const validRarities = ["common", "rare", "epic", "legendary"];
  if (!validRarities.includes(rarity)) {
    return NextResponse.json({ error: "Invalid rarity" }, { status: 400 });
  }

  const slug = rawSlug ? slugify(rawSlug) : slugify(name);

  // Check slug uniqueness
  const existing = await prisma.badge.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 409 });
  }

  const badge = await prisma.badge.create({
    data: { name, icon, color, rarity, description, slug },
  });

  return NextResponse.json({ ok: true, badge });
}
