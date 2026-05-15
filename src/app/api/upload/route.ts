import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // 8 MB limit
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const blob = await put(`uploads/${session.user.id}/${Date.now()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
