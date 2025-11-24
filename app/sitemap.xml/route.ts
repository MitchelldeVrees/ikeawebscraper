const baseUrl = "https://ikeatweedekans.com";

const routes = [
  { path: "/", priority: 1 },
  { path: "/guide-to-ikea-tweede-kans", priority: 0.8 },
  { path: "/ikea-tweede-kans-faq", priority: 0.7 },
  { path: "/manage", priority: 0.6 },
  { path: "/account", priority: 0.6 },
  { path: "/login", priority: 0.5 },
  { path: "/reset-password", priority: 0.5 },
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  const now = formatDate(new Date());

  const urlEntries = routes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
