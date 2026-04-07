import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@myfundingtrade/ui";
import { blogPosts } from "@/data/blog";
import { apiFetch } from "@/lib/api";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Trading insights, platform updates, and educational content from the MyFundingTrade team.",
  openGraph: {
    title: "Blog | MyFundingTrade",
    description: "Trading insights, platform updates, and educational content from the MyFundingTrade team.",
  },
};

interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryId: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  category?: { id: string; name: string; slug: string } | null;
  author?: { id: string; profile?: { firstName: string; lastName: string } | null } | null;
}

async function getPosts() {
  const data = await apiFetch<{ items: ApiBlogPost[]; total: number }>("/blog?pageSize=50");
  if (data && data.items?.length) {
    return data.items.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? "",
      category: p.category?.name ?? "General",
      publishedAt: p.publishedAt ?? "",
      readTime: `${Math.max(1, Math.ceil((p.excerpt?.length ?? 100) / 200))} min read`,
      coverImage: p.coverImage ?? "/blog/default.jpg",
      authorName: p.author?.profile ? `${p.author.profile.firstName} ${p.author.profile.lastName}` : "Trading Desk",
    }));
  }
  // Fallback to static data
  return blogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    publishedAt: p.publishedAt,
    readTime: p.readTime,
    coverImage: p.coverImage,
    authorName: p.author.name,
  }));
}

export default async function BlogPage() {
  const posts = await getPosts();

  const categories = [...new Set(posts.map((p) => p.category))];

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="brand" className="mb-4">Blog</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl">
            Trading <span className="gradient-text">Insights</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Educational content, platform updates, and pro-level trading strategies.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-4">
        <div className="section-container">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              All ({posts.length})
            </span>
            {categories.map((cat) => (
              <span key={cat} className="rounded-full border border-[#1a1f36] px-3 py-1 text-xs text-slate-400 hover:border-green-500/20 hover:text-green-400">
                {cat} ({posts.filter((p) => p.category === cat).length})
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="section-container">
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6 transition-colors hover:border-green-500/20"
              >
                <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-green-400">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="mb-2 text-xl font-bold text-slate-50 transition-colors group-hover:text-green-400">
                  {post.title}
                </h2>
                <p className="mb-4 text-sm text-slate-400 line-clamp-3">{post.excerpt}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-400">
                      {post.authorName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-xs text-slate-500">{post.authorName}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-green-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Read More <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
