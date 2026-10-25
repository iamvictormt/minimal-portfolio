import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Loader, NavRow, Reveal, TAGLINE, TopBar } from "@/components/site-chrome";
import { ProjectList } from "@/components/project-list";
import { projects } from "@/lib/projects";
import { FULL_NAME, LOCATION_LONG, LOCATION_SHORT, NAME_PARTS, SITE } from "@/lib/site";
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

const PHRASES = [
  "Trabalhos Selecionados",
  "Desenvolvedor Full Stack",
  `Baseado em ${LOCATION_SHORT}`,
  "Disponível para Colaborações",
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
  const row = [...PHRASES, ...PHRASES];
  return (
    <div
      ref={wrap}
      role="img"
      aria-label={PHRASES.join(", ")}
      className="overflow-hidden border-y border-foreground/15 py-6"
    >
      <div ref={track} aria-hidden className="flex w-max whitespace-nowrap will-change-transform">
        {[...row, ...row].map((p, i) => (
          <span key={i} className="flex items-center text-[7vw] leading-none md:text-[5vw]">
            <span className={i % 2 ? "font-medium tracking-[-0.04em]" : "display-serif"}>{p}</span>
            <span className="mx-[3vw] text-[3vw] md:text-[2vw]">✻</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* Line drawings for each plate, in a 500×400 box. They inherit the plate's text color. */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function FrontEndArt() {
  return (
    <g {...stroke}>
      {/* browser window */}
      <rect x="28" y="24" width="444" height="324" />
      <line x1="28" y1="62" x2="472" y2="62" />
      <circle cx="50" cy="43" r="6" />
      <circle cx="72" cy="43" r="6" />
      <circle cx="94" cy="43" r="6" />
      <rect x="130" y="34" width="250" height="18" />
      {/* hero copy */}
      <rect x="56" y="92" width="190" height="20" fill="currentColor" stroke="none" opacity="0.9" />
      <rect
        x="56"
        y="124"
        width="150"
        height="10"
        fill="currentColor"
        stroke="none"
        opacity="0.45"
      />
      <rect
        x="56"
        y="142"
        width="170"
        height="10"
        fill="currentColor"
        stroke="none"
        opacity="0.45"
      />
      <rect x="56" y="168" width="88" height="26" fill="currentColor" stroke="none" opacity="0.9" />
      {/* hero image: sun over hills */}
      <rect x="290" y="88" width="154" height="112" />
      <circle cx="338" cy="122" r="12" />
      <polyline points="290,200 342,152 380,184 400,166 444,200" />
      {/* cards */}
      <rect x="56" y="228" width="124" height="92" />
      <rect x="188" y="228" width="124" height="92" />
      <rect x="320" y="228" width="124" height="92" />
      <line x1="70" y1="252" x2="130" y2="252" />
      <line x1="202" y1="252" x2="262" y2="252" />
      <line x1="334" y1="252" x2="394" y2="252" />
      <line x1="70" y1="274" x2="160" y2="274" opacity="0.5" />
      <line x1="202" y1="274" x2="292" y2="274" opacity="0.5" />
      <line x1="334" y1="274" x2="424" y2="274" opacity="0.5" />
    </g>
  );
}

function ApiArt() {
  return (
    <g {...stroke}>
      <rect x="44" y="120" width="120" height="130" />
      <line x1="60" y1="148" x2="128" y2="148" />
      <line x1="60" y1="170" x2="148" y2="170" opacity="0.5" />
      <line x1="60" y1="190" x2="138" y2="190" opacity="0.5" />
      <rect x="336" y="120" width="120" height="130" />
      <line x1="352" y1="148" x2="420" y2="148" />
      <line x1="352" y1="170" x2="440" y2="170" opacity="0.5" />
      <line x1="352" y1="190" x2="430" y2="190" opacity="0.5" />
      {/* request → / ← response */}
      <line x1="186" y1="164" x2="314" y2="164" />
      <polyline points="300,152 314,164 300,176" />
      <line x1="314" y1="214" x2="186" y2="214" strokeDasharray="6 6" />
      <polyline points="200,202 186,214 200,226" />
      <text
        x="250"
        y="150"
        textAnchor="middle"
        fontSize="18"
        fill="currentColor"
        stroke="none"
        fontFamily="ui-monospace, monospace"
      >
        GET
      </text>
      <text
        x="250"
        y="244"
        textAnchor="middle"
        fontSize="18"
        fill="currentColor"
        stroke="none"
        fontFamily="ui-monospace, monospace"
      >
        200 {"{ }"}
      </text>
    </g>
  );
}

function DatabaseArt() {
  return (
    <g {...stroke}>
      <ellipse cx="250" cy="110" rx="92" ry="26" />
      <path d="M158 110 V250 A92 26 0 0 0 342 250 V110" />
      <path d="M158 156 A92 26 0 0 0 342 156" />
      <path d="M158 204 A92 26 0 0 0 342 204" />
      {/* rows hint */}
      <line x1="48" y1="150" x2="124" y2="150" opacity="0.5" />
      <line x1="48" y1="176" x2="124" y2="176" opacity="0.5" />
      <line x1="48" y1="202" x2="124" y2="202" opacity="0.5" />
      <line x1="376" y1="150" x2="452" y2="150" opacity="0.5" />
      <line x1="376" y1="176" x2="452" y2="176" opacity="0.5" />
      <line x1="376" y1="202" x2="452" y2="202" opacity="0.5" />
    </g>
  );
}

function DeployArt() {
  return (
    <g {...stroke}>
      {/* rocket */}
      <path d="M250 60 C284 100 292 160 276 214 H224 C208 160 216 100 250 60 Z" />
      <circle cx="250" cy="136" r="16" />
      <path d="M224 190 L190 232 L224 222" />
      <path d="M276 190 L310 232 L276 222" />
      <path d="M236 232 Q250 276 264 232" />
      {/* launch pad + trail */}
      <line x1="150" y1="316" x2="350" y2="316" />
      <line x1="40" y1="118" x2="120" y2="118" opacity="0.5" strokeDasharray="4 8" />
      <line x1="380" y1="170" x2="460" y2="170" opacity="0.5" strokeDasharray="4 8" />
      <line x1="60" y1="244" x2="130" y2="244" opacity="0.5" strokeDasharray="4 8" />
    </g>
  );
}

const LAYERS = [
  { label: "Front-end", Art: FrontEndArt },
  { label: "API", Art: ApiArt },
  { label: "Banco de dados", Art: DatabaseArt },
  { label: "Deploy", Art: DeployArt },
] as const;

/**
 * Four plates (the layers of a full stack app). The pointer tilts the stack; while the hero is pinned,
 * scrolling lifts the plates away one at a time so each layer's drawing gets its moment.
 */
function StackObject({ scene }: { scene: RefObject<HTMLDivElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const el = box.current;
    if (!el) return;
    let raf = 0;
    let mx = 0;
    let my = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    // Scroll progress through the pinned scene, as a stage from 0 to LAYERS.length - 1.
    let sraf = 0;
    const stageNow = () => {
      sraf = 0;
      const sc = scene.current;
      const stick = sc?.firstElementChild as HTMLElement | null;
      if (!sc || !stick) return;
      const top = parseFloat(getComputedStyle(stick).top) || 0;
      const travel = Math.max(1, sc.offsetHeight - stick.offsetHeight);
      const progress = Math.min(1, Math.max(0, (top - sc.getBoundingClientRect().top) / travel));
      const stage = progress * (LAYERS.length - 1);
      el.style.setProperty("--s", stage.toFixed(3));
      setActive(Math.min(LAYERS.length - 1, Math.round(stage)));
    };
    const onScroll = () => {
      if (!sraf) sraf = requestAnimationFrame(stageNow);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    stageNow();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sraf);
    };
  }, [scene]);
  const current = LAYERS[active] ?? LAYERS[0];
  return (
    <div className="mx-auto w-full max-w-sm md:w-[min(38vw,42rem)] md:max-w-none">
      <div
        ref={box}
        role="img"
        aria-label={`Camadas de uma aplicação full stack: ${LAYERS.map((l) => l.label).join(", ")}`}
        className="relative aspect-[5/4] w-full"
        style={{ perspective: "1400px" }}
      >
        <div
          className="absolute inset-[11%] md:transition-transform md:duration-200 md:ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform:
              "rotateX(calc(58deg + var(--my, 0) * -9deg)) rotateZ(calc(-38deg + var(--mx, 0) * 16deg + var(--s, 0) * 7deg))",
          }}
        >
          {LAYERS.map((layer, i) => {
            const top = i === 0;
            const last = i === LAYERS.length - 1;
            // 0 → 1 while this plate is lifted away (the last plate stays).
            const lift = last ? "0" : `clamp(0, calc(var(--s, 0) - ${i}), 1)`;
            return (
              <div
                key={layer.label}
                aria-hidden
                className={`absolute inset-0 border border-foreground ${top ? "bg-ink text-ink-foreground" : "bg-background text-foreground"}`}
                style={{
                  transform: `translateZ(calc(${LAYERS.length - 1 - i} * 2.1rem + ${lift} * 14rem))`,
                  opacity: `calc(1 - ${lift})`,
                  willChange: "transform, opacity",
                  boxShadow:
                    "0 1.2rem 2rem -0.8rem color-mix(in oklab, var(--ink) 35%, transparent)",
                }}
              >
                <svg
                  viewBox="0 0 500 400"
                  preserveAspectRatio="xMidYMid meet"
                  className="absolute inset-0 h-full w-full opacity-80"
                  aria-hidden
                >
                  <layer.Art />
                </svg>
                <span className="micro absolute bottom-3 left-3 font-mono uppercase">
                  {String(i + 1).padStart(2, "0")} · {layer.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {current ? (
        <p aria-hidden className="micro mt-2 text-center font-mono uppercase text-muted-foreground">
          {String(active + 1).padStart(2, "0")} / {String(LAYERS.length).padStart(2, "0")} ·{" "}
          {current.label}
        </p>
      ) : null}
    </div>
  );
}

function WorksTeaser() {
  return (
    <section aria-labelledby="teaser-title" className="pb-8 pt-16 md:pt-24">
      <div className="px-page mb-8 flex items-baseline justify-between gap-4 md:mb-12">
        <h2 id="teaser-title" className="micro uppercase">
          Projetos recentes
        </h2>
        <Link
          to="/works"
          className="micro uppercase underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
        >
          Todos os trabalhos ({String(projects.length).padStart(2, "0")}) →
        </Link>
      </div>
      <ProjectList limit={4} />
    </section>
  );
}

function Index() {
  const [loading, setLoading] = useState(true);
  const stage = useScrollVar();
  const scene = useRef<HTMLDivElement>(null);
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
      <div className="sticky top-0 z-40 mt-8 bg-background">
        <NavRow />
      </div>
      <div
        ref={scene}
        className="relative min-h-[calc(100svh_+_560px)] md:min-h-[calc(100svh_+_700px)] motion-reduce:min-h-0!"
      >
        <section className="px-page sticky top-[5.25rem] grid min-h-[calc(100svh_-_5.25rem)] w-full grid-cols-1 content-center items-stretch motion-reduce:static motion-reduce:min-h-0 md:top-[7rem] md:min-h-0 md:content-normal gap-8 py-8 md:grid-cols-[1fr_auto_1fr] md:gap-[3vw] md:py-16">
          <p className="mx-auto max-w-[22rem] text-balance text-center text-xl font-medium leading-snug tracking-[-0.02em] md:mx-0 md:mt-[6%] md:max-w-[19rem] md:self-start md:justify-self-end md:text-right md:text-[1.65rem] lg:max-w-[23rem] lg:text-3xl">
            Sou {SITE.firstName}, <span className="display-serif">desenvolvedor full stack</span> em{" "}
            {SITE.city}, {SITE.stateName}.
          </p>
          <div className="order-first md:order-none">
            <StackObject scene={scene} />
          </div>
          <p className="mx-auto max-w-[22rem] text-balance text-center text-xl font-medium leading-snug tracking-[-0.02em] md:mx-0 md:mb-[6%] md:max-w-[19rem] md:self-end md:justify-self-start md:text-left md:text-[1.65rem] lg:max-w-[23rem] lg:text-3xl">
            Construo produtos web <span className="display-serif">de ponta a ponta</span>, do banco
            de dados à interface.
          </p>
        </section>
      </div>
      <ScrollMarquee />
      <WorksTeaser />
      <section className="flex flex-col items-center gap-4 px-6 py-20 text-center md:py-28">
        <Link to="/works" className="group text-[11vw] leading-none md:text-[6vw]">
          <span className="display-serif">Veja</span>{" "}
          <span className="font-medium tracking-[-0.04em]">os trabalhos</span>{" "}
          <span className="inline-block font-medium transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-3 motion-reduce:transition-none">
            →
          </span>
        </Link>
      </section>
      <footer className="px-page flex flex-col items-center gap-2 pb-6 text-center">
        <Link
          to="/contact"
          className="micro uppercase underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
        >
          Aberto a colaborações — fale comigo →
        </Link>
        <span className="micro text-muted-foreground">{TAGLINE}</span>
      </footer>
    </main>
  );
}
