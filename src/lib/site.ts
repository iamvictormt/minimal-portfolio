export type Social = { label: string; href: string; display: string };

/** Single source of truth for who this portfolio belongs to. Fill the empty fields to publish them. */
export const SITE = {
  firstName: "Victor",
  /** Optional surname. When empty, the home wordmark splits the first name in two. */
  lastName: "Monteiro",
  /** Contact address shown on the contact page and in the terminal. Empty hides it. */
  email: "victoorres@icloud.com",
  /** WhatsApp number with country code, digits only. Empty hides WhatsApp. */
  whatsapp: "5562985329181",
  whatsappDisplay: "+55 62 98532-9181",
  /** Social links shown on the contact page. */
  socials: [
    { label: "Instagram", href: "https://instagram.com/iamvictormt", display: "@iamvictormt" },
    { label: "LinkedIn", href: "https://linkedin.com/in/iamvictormt", display: "in/iamvictormt" },
    { label: "GitHub", href: "https://github.com/iamvictormt", display: "iamvictormt" },
  ] as Social[],
  city: "Anápolis",
  state: "GO",
  stateName: "Goiás",
  country: "Brasil",
  timeZone: "America/Sao_Paulo",
  utc: "UTC−3",
  /**
   * Public address of the site, without a trailing slash (e.g. "https://victormonteiro.dev").
   * Needed for canonical links, social previews and structured data. Set it here or with VITE_SITE_URL.
   */
  url: (
    (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "https://eu-victor.vercel.app"
  ).replace(/\/+$/, ""),
};

export const FULL_NAME = [SITE.firstName, SITE.lastName].filter(Boolean).join(" ");

/** Wordmark halves: italic serif + regular sans. */
export const NAME_PARTS: [string, string] = SITE.lastName
  ? [SITE.firstName, SITE.lastName]
  : [
      SITE.firstName.slice(0, Math.ceil(SITE.firstName.length / 2)),
      SITE.firstName.slice(Math.ceil(SITE.firstName.length / 2)),
    ];

export const LOCATION_SHORT = `${SITE.city}, ${SITE.state}`;
export const LOCATION_LONG = `${SITE.city}, ${SITE.stateName}, ${SITE.country}`;

export const EMAIL = SITE.email;

export const WHATSAPP_URL = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}` : "";

/** WhatsApp link with a greeting already typed. Empty when no number is set. */
export const WHATSAPP_HREF = WHATSAPP_URL
  ? `${WHATSAPP_URL}?text=${encodeURIComponent(`Olá, ${SITE.firstName}! Vim pelo seu portfólio.`)}`
  : "";

/** Everything I work with, grouped by area. About and the structured data read from here. */
export const SKILLS = {
  frontend: [
    "Angular 2+ (até a v18)",
    "AngularJS",
    "RxJS",
    "React",
    "Next.js",
    "TypeScript",
    "HTML",
    "CSS",
  ],
  backend: [
    "Java",
    "Spring Boot",
    "Quarkus",
    "APIs REST",
    "JPA/Hibernate",
    "Apache Maven",
    "JUnit",
    "Node.js",
  ],
  database: ["Oracle", "SQL", "Modelagem de dados", "Mapeamento de entidades"],
  devops: ["Git", "Docker", "Jenkins", "CI/CD"],
};
