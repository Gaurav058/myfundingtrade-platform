import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { blogPosts } from "@/data/blog";

const BASE_URL = "https://myfundingtrade.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/challenge`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/affiliate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/legal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/terms-and-conditions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/refund-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/disclaimer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  const apiSlugs = await apiFetch<{ slug: string; updatedAt: string }[]>("/blog/slugs");
  if (apiSlugs && apiSlugs.length) {
    blogEntries = apiSlugs.map((s) => ({
      url: `${BASE_URL}/blog/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } else {
    // Fallback to static blog data
    blogEntries = blogPosts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  }

  return [...staticPages, ...blogEntries];
}
