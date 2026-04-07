import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { Badge, Button } from "@myfundingtrade/ui";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="pt-32 pb-8 md:pt-40">
        <div className="section-container max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-green-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <Badge variant="brand" className="mb-4">{post.category}</Badge>
          <h1 className="mb-4 text-3xl font-bold text-slate-50 md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mb-6 text-lg text-slate-400">{post.excerpt}</p>

          <div className="flex items-center gap-4 border-b border-[#1a1f36] pb-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-400">
                {post.author.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-slate-300">{post.author.name}</p>
              </div>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="section-container max-w-3xl">
          <article className="prose prose-invert prose-green max-w-none prose-headings:font-bold prose-headings:text-slate-50 prose-p:text-slate-300 prose-a:text-green-400 prose-strong:text-slate-200 prose-li:text-slate-300">
            {/* In a real app, render markdown with MDX or remark. For the mock, render paragraphs. */}
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("## ")) {
                return <h2 key={i}>{paragraph.replace("## ", "")}</h2>;
              }
              if (paragraph.startsWith("### ")) {
                return <h3 key={i}>{paragraph.replace("### ", "")}</h3>;
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <ul key={i}>
                    {paragraph.split("\n").map((li, j) => (
                      <li key={j}>{li.replace("- ", "")}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{paragraph}</p>;
            })}
          </article>

          <div className="mt-12 flex items-center justify-between border-t border-[#1a1f36] pt-8">
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
