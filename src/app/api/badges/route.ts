import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const badges = await prisma.badge.findMany({ orderBy: { rarity: "desc" } });
  return NextResponse.json(badges);
}
