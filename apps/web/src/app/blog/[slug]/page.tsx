import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { apiFetch } from "@/lib/api";
import { Badge, Button } from "@myfundingtrade/ui";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

interface ApiPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  category?: { id: string; name: string; slug: string } | null;
  author?: { id: string; profile?: { firstName: string; lastName: string } | null } | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  category?: { name: string; slug: string } | null;
}

async function getPost(slug: string) {
  const apiPost = await apiFetch<ApiPost>(`/blog/${slug}`);
  if (apiPost && apiPost.slug) return apiPost;
  const local = blogPosts.find((p) => p.slug === slug);
  if (!local) return null;
  return {
    id: local.slug,
    title: local.title,
    slug: local.slug,
    excerpt: local.excerpt,
    content: local.content,
    coverImage: local.coverImage,
    publishedAt: local.publishedAt,
    seoTitle: null,
    seoDescription: null,
    category: { id: "", name: local.category, slug: local.category.toLowerCase() },
    author: { id: "", profile: { firstName: local.author.name.split(" ")[0], lastName: local.author.name.split(" ").slice(1).join(" ") || "" } },
  } as ApiPost;
}

async function getRelated(slug: string): Promise<RelatedPost[]> {
  const data = await apiFetch<RelatedPost[]>(`/blog/${slug}/related?limit=3`);
  if (data && data.length) return data;
  // Fallback: pick other static posts
  return blogPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({
      id: p.slug,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      publishedAt: p.publishedAt,
      category: { name: p.category, slug: p.category.toLowerCase() },
    }));
}

export async function generateStaticParams() {
  const apiSlugs = await apiFetch<{ slug: string }[]>("/blog/slugs");
  if (apiSlugs && apiSlugs.length) {
    return apiSlugs.map((s) => ({ slug: s.slug }));
  }
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  const authorName = post.author?.profile
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`.trim()
    : "MyFundingTrade";
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: [authorName],
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
    },
  };
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 250))} min read`;
}

function renderMarkdown(content: string) {
  return content.split("\n\n").map((paragraph, i) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return <h2 key={i}>{trimmed.replace("## ", "")}</h2>;
    }
    if (trimmed.startsWith("### ")) {
      return <h3 key={i}>{trimmed.replace("### ", "")}</h3>;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <ul key={i}>
          {trimmed.split("\n").map((li, j) => (
            <li key={j}>{li.replace(/^[-*] /, "")}</li>
          ))}
        </ul>
      );
    }
    if (trimmed.startsWith("1. ")) {
      return (
        <ol key={i}>
          {trimmed.split("\n").map((li, j) => (
            <li key={j}>{li.replace(/^\d+\. /, "")}</li>
          ))}
        </ol>
      );
    }
    if (trimmed.startsWith("> ")) {
      return <blockquote key={i}>{trimmed.replace(/^> ?/gm, "")}</blockquote>;
    }
    return <p key={i}>{trimmed}</p>;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, relatedPosts] = await Promise.all([getPost(slug), getRelated(slug)]);

  if (!post) {
    notFound();
  }

  const authorName = post.author?.profile
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`.trim()
    : "Trading Desk";
  const readTime = estimateReadTime(post.content);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "MyFundingTrade", url: "https://myfundingtrade.com" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="pt-32 pb-8 md:pt-40">
        <div className="section-container max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-green-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <Badge variant="brand" className="mb-4">{post.category?.name ?? "General"}</Badge>
          <h1 className="mb-4 text-3xl font-bold text-slate-50 md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mb-6 text-lg text-slate-400">{post.excerpt}</p>

          <div className="flex items-center gap-4 border-b border-[#1a1f36] pb-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-400">
                {authorName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-slate-300">{authorName}</p>
              </div>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime}
            </span>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="section-container max-w-3xl">
          <article className="prose prose-invert prose-green max-w-none prose-headings:font-bold prose-headings:text-slate-50 prose-p:text-slate-300 prose-a:text-green-400 prose-strong:text-slate-200 prose-li:text-slate-300">
            {renderMarkdown(post.content)}
          </article>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-[#1a1f36] py-16">
          <div className="section-container max-w-3xl">
            <h2 className="mb-8 text-xl font-bold text-slate-50">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group rounded-xl border border-[#1a1f36] bg-[#0c1020] p-4 transition-colors hover:border-green-500/20"
                >
                  <span className="mb-2 block text-xs text-green-400">{rp.category?.name ?? "General"}</span>
                  <h3 className="text-sm font-semibold text-slate-50 transition-colors group-hover:text-green-400 line-clamp-2">
                    {rp.title}
                  </h3>
                  {rp.publishedAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(rp.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="section-container max-w-3xl">
          <div className="flex items-center justify-between border-t border-[#1a1f36] pt-8">
            <Button variant="ghost" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Posts
              </Link>
            </Button>
            <Button variant="primary" asChild>
              <Link href="/challenge">Start Your Challenge</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
