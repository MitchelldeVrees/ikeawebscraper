import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/manage", "/login", "/reset-password", "/welcome"],
    },
    sitemap: "https://ikeatweedekans.com/sitemap.xml",
  };
}
