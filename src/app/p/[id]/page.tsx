import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import VoteButtons from "@/components/VoteButtons";
import CommentSection from "./CommentSection";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, displayName: true, accentColor: true } },
      community: { select: { slug: true, name: true, themeColor: true } },
      votes: { select: { value: true, userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { username: true, accentColor: true } },
        },
      },
    },
  });

  if (!post) notFound();

  const userId = session.user.id;
  const score = post.votes.reduce((s, v) => s + v.value, 0);
  const myVote = post.votes.find(v => v.userId === userId)?.value ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 text-white">
      <header className="border-b border-white/10 backdrop-blur sticky top-0 bg-black/40 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vocalize</Link>
          <Link href="/feed" className="text-sm text-gray-400 hover:text-white">← back</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <article className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 flex gap-3">
          <VoteButtons postId={post.id} initialScore={score} initialVote={myVote} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              {post.community && (
                <Link href={`/c/${post.community.slug}`} className="font-medium" style={{ color: post.community.themeColor || "#ec4899" }}>
                  c/{post.community.slug}
                </Link>
              )}
              <span>·</span>
              <span style={{ color: post.author.accentColor || "#a78bfa" }}>@{post.author.username}</span>
              <span>·</span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
          </div>
        </article>

        <CommentSection postId={post.id} initialComments={post.comments.map(c => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          author: c.author,
        }))} />
      </div>
    </main>
  );
}
