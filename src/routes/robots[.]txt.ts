import { createFileRoute } from "@tanstack/react-router";

/** robots.txt, with the sitemap on whichever address the site is served from. */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${origin}/sitemap.xml`, ""].join(
          "\n",
        );
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
