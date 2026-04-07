import { apiFetch } from "@/lib/api";
import { blogPosts } from "@/data/blog";

const BASE_URL = "https://myfundingtrade.com";

interface FeedPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  authorName: string;
}

async function getFeedPosts(): Promise<FeedPost[]> {
  const data = await apiFetch<{
    items: {
      title: string;
      slug: string;
      excerpt: string | null;
      publishedAt: string | null;
      author?: { id: string; profile?: { firstName: string; lastName: string } | null } | null;
    }[];
  }>("/blog?pageSize=50");

  if (data && data.items?.length) {
    return data.items.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      publishedAt: p.publishedAt ?? new Date().toISOString(),
      authorName: p.author?.profile
        ? `${p.author.profile.firstName} ${p.author.profile.lastName}`.trim()
        : "MyFundingTrade",
    }));
  }

  return blogPosts.map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    authorName: p.author.name,
  }));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getFeedPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${escapeXml(post.authorName)}</author>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MyFundingTrade Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Trading insights, platform updates, and educational content from MyFundingTrade.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
