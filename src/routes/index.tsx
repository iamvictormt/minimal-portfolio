import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader, NavRow, Reveal, TAGLINE, TopBar } from "@/components/site-chrome";
import hands from "@/assets/hands.webp";
import { HandsBanner } from "@/components/hands-banner";
import { CopyEmailRow, WhatsAppCta } from "@/components/contact-parts";
import { PROJECT_IMAGE_SIZE, projects } from "@/lib/projects";
import { FULL_NAME, LOCATION_LONG, NAME_PARTS, SITE, WHATSAPP_HREF } from "@/lib/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      path: "/",
      title: `${FULL_NAME} — Desenvolvedor Full Stack`,
      description: `Sou ${FULL_NAME}, desenvolvedor full stack de ${LOCATION_LONG}. Construo produtos web de ponta a ponta, do banco de dados à interface.`,
    }),
  component: Index,
});

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Publishes window.scrollY as `--y` on the element, outside React's render cycle. */
function useScrollVar() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0;
    const write = () => {
      raf = 0;
      ref.current?.style.setProperty("--y", String(window.scrollY));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

/** The tools I work with most, in the scrolling band. Keep the count even so the italic/regular alternation lines up when it loops. */
const STACK = [
  "Java",
  "Spring Boot",
  "Quarkus",
  "APIs REST",
  "Angular",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Oracle",
  "Docker",
  "CI/CD",
];

function ScrollMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    let x = 0;
    let dir = 1;
    let boost = 0;
    let last = window.scrollY;
    let raf = 0;
    const tick = () => {
      const s = window.scrollY;
      const d = s - last;
      last = s;
      if (d !== 0) dir = d > 0 ? 1 : -1;
      boost = boost * 0.9 + Math.abs(d) * 0.15;
      x -= dir * (0.6 + boost);
      const el = track.current;
      if (el) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          if (x <= -half) x += half;
          if (x > 0) x -= half;
        }
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    // Only run the loop while the band is on screen.
    const io = new IntersectionObserver((entries) => {
      cancelAnimationFrame(raf);
      if (entries.some((e) => e.isIntersecting)) {
        last = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  const row = [...STACK, ...STACK];
  return (
    <div
      ref={wrap}
      role="img"
      aria-label={STACK.join(", ")}
      className="overflow-hidden bg-ink py-6 text-ink-foreground"
    >
      <div ref={track} aria-hidden className="flex w-max whitespace-nowrap will-change-transform">
        {[...row, ...row].map((p, i) => (
          <span key={i} className="flex items-center text-[7vw] leading-none md:text-[5vw]">
            <span className={i % 2 ? "font-medium tracking-[-0.04em]" : "display-serif"}>{p}</span>
            <span className="mx-[3vw] text-[3vw] text-accent md:text-[2vw]">✻</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured && p.href);
  return (
    <section aria-labelledby="featured-title" className="px-page pb-12 pt-16 md:pb-20 md:pt-24">
      <div className="mb-8 flex items-baseline justify-between gap-4 md:mb-12">
        <h2 id="featured-title" className="micro uppercase">
          Projetos em destaque
        </h2>
        <Link
          to="/works"
          className="micro uppercase underline decoration-foreground/40 underline-offset-4 hover:bg-accent hover:decoration-foreground"
        >
          Todos os projetos ({String(projects.length).padStart(2, "0")}) →
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
        {featured.map((p, i) => (
          <li key={p.name} className={i % 2 === 1 ? "md:mt-20" : ""}>
            <a href={p.href} target="_blank" rel="noreferrer" className="group block">
              <span className="block overflow-hidden border border-border bg-muted">
                <img
                  src={p.image}
                  alt={p.imageAlt ?? `Captura de tela do projeto ${p.name}`}
                  width={PROJECT_IMAGE_SIZE.width}
                  height={PROJECT_IMAGE_SIZE.height}
                  loading="lazy"
                  className="aspect-[8/5] w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-4">
                <span className="text-3xl font-medium leading-none tracking-[-0.04em] md:text-4xl">
                  <span className="display-serif">{p.name.slice(0, 1)}</span>
                  {p.name.slice(1)} <span aria-hidden>↗</span>
                </span>
                <span className="micro shrink-0 bg-accent px-2 py-1 uppercase text-accent-foreground">
                  {p.type}
                </span>
              </span>
              <span className="mt-3 block max-w-[34rem] text-sm leading-relaxed text-foreground/70 md:text-base">
                {p.description}
              </span>
              <span className="micro mt-3 block uppercase text-foreground/70">
                {p.stack.join(" · ")}
              </span>
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Index() {
  const [loading, setLoading] = useState(true);
  const stage = useScrollVar();
  return (
    <main ref={stage} className="flex min-h-screen flex-col">
      {loading && <Loader onDone={() => setLoading(false)} />}
      <TopBar />
      <h1
        className="px-page flex flex-wrap items-start justify-center pt-6 leading-[0.9] will-change-transform md:pt-4"
        style={{
          transform: "translateY(calc(var(--y, 0) * 0.35px))",
          opacity: "max(0, calc(1 - var(--y, 0) / 500))",
        }}
      >
        <span className="display-serif text-[14vw] md:text-[13vw]">
          <Reveal delay={1500}>{NAME_PARTS[0]}</Reveal>
        </span>
        <span className="ml-[1vw] text-[14vw] font-medium tracking-[-0.05em] md:text-[13vw]">
          <Reveal delay={1650}>{NAME_PARTS[1]}</Reveal>
        </span>
      </h1>
      <NavRow />
      <HandsBanner
        src={hands}
        alt="Uma mão humana e uma mão de robô, feitas de pontos, se aproximando de uma janela chamada PROJECT.EXE"
        {...(WHATSAPP_HREF
          ? {
              cta: {
                label: "Vamos tirar o seu projeto do papel?",
                action: "Chamar no WhatsApp ↗",
                href: WHATSAPP_HREF,
                external: true,
              },
            }
          : {})}
      />
      <section className="px-page grid grid-cols-1 gap-8 py-12 md:grid-cols-2 md:gap-[6vw] md:py-20">
        <p className="max-w-[26rem] text-balance text-3xl font-medium leading-[1.1] tracking-[-0.03em] md:text-[2.4vw]">
          Sou {SITE.firstName}, <span className="display-serif">desenvolvedor full stack</span> de{" "}
          {SITE.city}, {SITE.stateName}.
        </p>
        <div className="flex flex-col items-start gap-5 md:justify-self-end">
          <p className="max-w-[26rem] text-balance text-3xl font-medium leading-[1.1] tracking-[-0.03em] md:text-[2.4vw]">
            Construo produtos web <span className="display-serif">de ponta a ponta</span>, do banco
            de dados à interface.
          </p>
          <Link
            to="/about"
            className="micro uppercase underline decoration-foreground/40 underline-offset-4 hover:bg-accent hover:decoration-foreground"
          >
            Como eu trabalho →
          </Link>
        </div>
      </section>
      <ScrollMarquee />
      <FeaturedProjects />
      <section
        aria-labelledby="closing-title"
        className="px-page grid grid-cols-1 gap-10 border-t border-border py-16 md:grid-cols-[5fr_7fr] md:gap-20 md:py-24"
      >
        <div className="flex flex-col gap-6">
          <h2
            id="closing-title"
            className="text-balance text-[8.5vw] font-medium leading-[1.05] tracking-[-0.04em] md:text-[3.4vw]"
          >
            Tem um projeto em mente? <span className="display-serif">Vamos conversar.</span>
          </h2>
          <p className="max-w-[26rem] text-base leading-relaxed md:text-lg">
            Por e-mail, respondo em 1–2 dias úteis.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <WhatsAppCta />
          <ul className="border-t border-border">
            <CopyEmailRow />
          </ul>
        </div>
      </section>
      <footer className="micro pb-5 text-center">{TAGLINE}</footer>
    </main>
  );
}
