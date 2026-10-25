import { projects } from "@/lib/projects";
import { FULL_NAME, LOCATION_LONG, SITE } from "@/lib/site";

export const ROUTES = ["/", "/works", "/about", "/playground", "/contact"] as const;
export type RoutePath = (typeof ROUTES)[number];

/** Absolute URL for a path, or undefined while the site address is not configured. */
export const absoluteUrl = (path: string) =>
  SITE.url ? `${SITE.url}${path === "/" ? "/" : path}` : undefined;

const ROLE = "Desenvolvedor Full Stack";
const OG_IMAGE = "/og.jpg";

type PageSeo = { title: string; description: string; path: RoutePath };

/** Title, description, canonical, Open Graph and Twitter tags for one page. */
export function seo({ title, description, path }: PageSeo) {
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE);
  const meta = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: `${FULL_NAME} — Portfólio` },
    { property: "og:locale", content: "pt_BR" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(url ? [{ property: "og:url", content: url }] : []),
    ...(image
      ? [
          { property: "og:image", content: image },
          { property: "og:image:type", content: "image/jpeg" },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { property: "og:image:alt", content: `${FULL_NAME} — ${ROLE}` },
        ]
      : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(image ? [{ name: "twitter:image", content: image }] : []),
  ];
  const links = url ? [{ rel: "canonical", href: url }] : [];
  return { meta, links };
}

/** Escapes a JSON-LD payload so it can sit inside a <script> tag. */
const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

const knowsAbout = [...new Set(projects.flatMap((p) => p.stack))];

/** Person and WebSite structured data, shared by every page. */
export function siteStructuredData() {
  const url = absoluteUrl("/");
  return [
    {
      type: "application/ld+json",
      children: jsonLd({
        "@context": "https://schema.org",
        "@type": "Person",
        name: FULL_NAME,
        jobTitle: ROLE,
        description: `Desenvolvedor full stack de ${LOCATION_LONG}.`,
        url,
        image: absoluteUrl(OG_IMAGE),
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.city,
          addressRegion: SITE.state,
          addressCountry: "BR",
        },
        knowsAbout,
        sameAs: SITE.socials.map((s) => s.href),
      }),
    },
    {
      type: "application/ld+json",
      children: jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: `${FULL_NAME} — Portfólio`,
        url,
        inLanguage: "pt-BR",
        author: { "@type": "Person", name: FULL_NAME },
      }),
    },
  ];
}

/** ItemList of the portfolio projects, for the projects page. */
export function projectsStructuredData() {
  return {
    type: "application/ld+json",
    children: jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Projetos de ${FULL_NAME}`,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.name,
          description: p.description,
          genre: p.type,
          url: p.href ?? absoluteUrl(p.to ?? "/"),
          author: { "@type": "Person", name: FULL_NAME },
        },
      })),
    }),
  };
}
