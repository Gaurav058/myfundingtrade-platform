import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/portal/", "/admin/"],
      },
    ],
    sitemap: "https://myfundingtrade.com/sitemap.xml",
  };
}
