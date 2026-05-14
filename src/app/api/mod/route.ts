import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function isMod(userId: string, communityId: string | null) {
  if (!communityId) return false;
  const m = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });
  return m?.role === "mod" || m?.role === "owner";
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { action, targetType, targetId, reason, communityId } = body;

  if (!await isMod(session.user.id, communityId)) {
    return NextResponse.json({ error: "not a mod" }, { status: 403 });
  }

  if (action === "delete_post") {
    // Hard delete — cascades to comments, votes, etc. via Prisma schema
    await prisma.post.delete({ where: { id: targetId } });
    await prisma.modAction.create({
      data: { modId: session.user.id, communityId, action, targetType: "post", targetId, reason: reason || null },
    });
    return NextResponse.json({ ok: true });
  } else if (action === "remove_post") {
    await prisma.post.update({ where: { id: targetId }, data: { removed: true, removedReason: reason || null } });
  } else if (action === "remove_comment") {
    await prisma.comment.update({ where: { id: targetId }, data: { removed: true } });
  } else if (action === "lock") {
    await prisma.post.update({ where: { id: targetId }, data: { locked: true } });
  } else if (action === "unlock") {
    await prisma.post.update({ where: { id: targetId }, data: { locked: false } });
  } else if (action === "pin") {
    await prisma.post.update({ where: { id: targetId }, data: { pinned: true } });
  } else if (action === "unpin") {
    await prisma.post.update({ where: { id: targetId }, data: { pinned: false } });
  } else if (action === "resolve_report") {
    await prisma.report.update({ where: { id: targetId }, data: { status: "resolved" } });
    return NextResponse.json({ ok: true });
  } else if (action === "dismiss_report") {
    await prisma.report.update({ where: { id: targetId }, data: { status: "dismissed" } });
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  await prisma.modAction.create({
    data: {
      modId: session.user.id,
      communityId,
      action,
      targetType,
      targetId,
      reason: reason || null,
    },
  });
  return NextResponse.json({ ok: true });
}
