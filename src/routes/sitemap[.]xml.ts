import { createFileRoute } from "@tanstack/react-router";
import { ROUTES } from "@/lib/seo";

/** sitemap.xml built from the route list, on whichever address the site is served from. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = ROUTES.map(
          (path) =>
            `  <url>\n    <loc>${origin}${path}</loc>\n    <priority>${path === "/" ? "1.0" : "0.8"}</priority>\n  </url>`,
        ).join("\n");
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
