const baseUrl = "https://ikeatweedekans.com";

const routes = [
  { path: "/", priority: 1 },
  { path: "/alles-over-ikea-tweede-kans", priority: 0.9 },
  { path: "/ikea-tweede-kans-amsterdam", priority: 0.75 },
  { path: "/ikea-tweede-kans-haarlem", priority: 0.75 },
  { path: "/ikea-tweede-kans-delft", priority: 0.75 },
  { path: "/ikea-tweede-kans-faq", priority: 0.7 },
  { path: "/contact", priority: 0.65 },
  { path: "/privacy", priority: 0.6 },
  { path: "/disclaimer", priority: 0.6 },
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  const now = formatDate(new Date());

  const urlEntries = routes
    .map(
      (route) => {
        const url = `${baseUrl}${route.path}`;
        return `
  <url>
    <loc>${url}</loc>
    <xhtml:link rel="alternate" hreflang="nl-NL" href="${url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />
    <lastmod>${now}</lastmod>
    <priority>${route.priority}</priority>
  </url>`;
      }
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
