import img_nacho_man from "@/assets/projects/nacho-man.jpg";
import img_nacho_factory from "@/assets/projects/nacho-factory.jpg";
import img_atelie_norte from "@/assets/projects/atelie-norte.jpg";
import img_luna_shop from "@/assets/projects/luna-shop.jpg";
import img_tennispool from "@/assets/projects/tennispool.jpg";
import img_farejei from "@/assets/projects/farejei.jpg";
import img_imdn from "@/assets/projects/imdn.jpg";
import img_serra_alta from "@/assets/projects/serra-alta.jpg";
import img_frodotech from "@/assets/projects/frodotech.jpg";
import img_ohomemso from "@/assets/projects/ohomemso.jpg";
import img_up_connection from "@/assets/projects/up-connection.jpg";

export type Project = {
  name: string;
  /** Screenshot of the live system (1200×750). */
  image: string;
  type: string;
  description: string;
  role?: string;
  stack: string[];
  /** External site, opened in a new tab. */
  href?: string;
  /** Internal route. */
  to?: "/" | "/playground";
};

export const projects: Project[] = [
  {
    name: "Nacho Man",
    image: img_nacho_man,
    type: "Site institucional",
    description:
      "Site da rede com a história da marca, cardápio, contato e captação de novos parceiros.",
    role: "Direção visual, front-end e deploy",
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://nachomanbrasil.com.br/",
  },
  {
    name: "Nacho Factory",
    image: img_nacho_factory,
    type: "Marketplace",
    description: "Marketplace para afiliados da rede Nacho Man, com catálogo e fluxo comercial.",
    role: "Produto, full-stack e integrações",
    stack: ["Next.js", "Tailwind", "Framer Motion", "PostgreSQL", "Saipos", "Hostinger VPS"],
    href: "https://nachofactory.com.br/",
  },
  {
    name: "Ateliê Norte",
    image: img_atelie_norte,
    type: "Landing page",
    description:
      "Landing page de estúdio de arquitetura, voltada à apresentação dos serviços e à geração de contatos.",
    role: "Direção visual e front-end",
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://atelie-norte-arquitetura.vercel.app/",
  },
  {
    name: "Luna Shop",
    image: img_luna_shop,
    type: "E-commerce",
    description:
      "Loja virtual de moda com catálogo por categoria, busca, favoritos e sacola de compras.",
    stack: ["Next.js"],
    href: "https://uselunashop.vercel.app/",
  },
  {
    name: "TennisPool",
    image: img_tennispool,
    type: "Plataforma web",
    description:
      "Plataforma de bolão de tênis com ranking em tempo real, premiações, gestão de usuários e notificações.",
    role: "Produto, full-stack e arquitetura",
    stack: ["Next.js", "Tailwind", "Framer Motion", "Resend API", "NeonDB"],
    href: "https://tennispool.com.br/",
  },
  {
    name: "Farejei",
    image: img_farejei,
    type: "Plataforma web",
    description:
      "Rede para localizar animais desaparecidos, com anúncios geolocalizados, pet shops parceiros e serviços premium.",
    role: "Produto, full-stack e pagamentos",
    stack: ["Next.js", "Tailwind", "Stripe"],
    href: "https://www.farejeiapp.com.br/",
  },
  {
    name: "IMDN",
    image: img_imdn,
    type: "Plataforma EAD",
    description:
      "Plataforma EAD para o mercado angolano, com cursos, gestão de conteúdo e pagamentos via AppyPay.",
    role: "Full-stack, integrações e pagamentos",
    stack: ["Next.js", "NestJS", "GraphQL", "Tailwind", "AppyPay"],
    href: "https://www.institutomdn.com/",
  },
  {
    name: "Serra Alta",
    image: img_serra_alta,
    type: "Landing page",
    description:
      "Landing page de hospedagem na Serra da Mantiqueira, com apresentação dos chalés e foco em conversão de reservas.",
    role: "Direção visual e front-end",
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://serra-alta.vercel.app/",
  },
  {
    name: "FrodoTech",
    image: img_frodotech,
    type: "Landing page",
    description:
      "Landing page para empresa de tecnologia e assessoria em TI, com apresentação dos serviços e geração de leads.",
    role: "Direção visual e front-end",
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://frodotech.vercel.app/",
  },
  {
    name: "OHomemSó",
    image: img_ohomemso,
    type: "Site",
    description:
      "Site de cantor e compositor, com identidade artística, conteúdo editorial e atualização via Notion.",
    role: "Direção visual, front-end e CMS",
    stack: ["Next.js", "Tailwind", "Framer Motion", "Notion"],
    href: "https://www.ohomemso.com.br/",
  },
  {
    name: "UP Connection",
    image: img_up_connection,
    type: "SaaS",
    description:
      "SaaS de networking para decoração e design de interiores, com oportunidades, parcerias e pagamentos.",
    role: "Produto, full-stack e pagamentos",
    stack: ["Next.js", "NestJS", "GraphQL", "Tailwind", "Stripe"],
    href: "https://www.upconnection.app/",
  },
];

export const PROJECT_IMAGE_SIZE = { width: 1200, height: 750 } as const;
