import { Link } from "@tanstack/react-router";
import { LOCATION_SHORT, SITE } from "@/lib/site";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Current local time of the site owner (HH:MM), empty until mounted so SSR and hydration match. */
export function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: SITE.timeZone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function TopBar() {
  const time = useLocalTime();
  return (
    <header className="px-page grid grid-cols-3 items-start pt-5">
      <Link
        to="/contact"
        className="micro group flex items-center gap-2 justify-self-start underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground"
      >
        <span aria-hidden className="relative flex size-2 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-foreground opacity-40 motion-reduce:animate-none" />
          <span className="relative size-2 rounded-full bg-foreground" />
        </span>
        <span>Disponível para projetos</span>
      </Link>
      <Link to="/" className="justify-self-center text-sm font-semibold tracking-tight">
        {SITE.firstName.toUpperCase()}
        <sup className="text-[0.5rem]">®</sup>
      </Link>
      <div className="micro justify-self-end text-right">
        {LOCATION_SHORT}
        <br />
        <span className="tabular-nums">{time || "--:--"}</span>
      </div>
    </header>
  );
}

const nav = [
  { n: "01", label: "Trabalhos", to: "/works" as const },
  { n: "02", label: "Sobre", to: "/about" as const },
  { n: "03", label: "Laboratório", to: "/playground" as const },
  { n: "04", label: "Contato", to: "/contact" as const },
];

export const TAGLINE = `Feito em ${SITE.city}, ${SITE.stateName}, linha por linha.`;

export function NavRow() {
  return (
    // Hairlines run edge to edge; the links sit on the page gutter. Hovering dims the others, and the
    // current page keeps its underline.
    <nav
      aria-label="Principal"
      className="px-page grid grid-cols-4 border-y border-foreground/15 [&:focus-within>a:not(:focus-within)]:opacity-40 [&:hover>a:not(:hover)]:opacity-40"
    >
      {nav.map((i) => (
        <Link
          key={i.label}
          to={i.to}
          className="group block py-5 transition-opacity duration-300 motion-reduce:transition-none md:py-6"
        >
          <span className="micro block text-muted-foreground">{i.n}</span>
          <span className="mt-1 block text-xs font-medium tracking-tight md:text-xl">
            <span className="underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors duration-300 group-hover:decoration-foreground group-focus-visible:decoration-foreground group-data-[status=active]:decoration-foreground">
              {i.label}
            </span>
          </span>
        </Link>
      ))}
    </nav>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="-mb-[0.3em] -mr-[0.18em] -mt-[0.1em] inline-block overflow-hidden pb-[0.3em] pr-[0.18em] pt-[0.1em] align-bottom">
      <span className="animate-rise inline-block" style={{ animationDelay: `${delay}ms` }}>
        {children}
      </span>
    </span>
  );
}

/** Page heading shared by every inner page, at the same scale as the home wordmark. */
export function PageTitle({ italic, children }: { italic: ReactNode; children: ReactNode }) {
  return (
    <h1 className="px-page flex flex-wrap justify-center gap-x-[1.5vw] pt-6 text-center text-[14vw] leading-[0.9] md:pt-4 md:text-[13vw]">
      <span className="display-serif">
        <Reveal delay={1500}>{italic}</Reveal>
      </span>
      <span className="font-medium tracking-[-0.05em]">
        <Reveal delay={1650}>{children}</Reveal>
      </span>
    </h1>
  );
}

/** Full-screen intro shown once on page load. */
export function Loader({
  dark = false,
  title,
  onDone,
}: {
  dark?: boolean;
  title?: ReactNode;
  onDone?: () => void;
}) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 4)), 45);
    const l = setTimeout(() => setLeaving(true), 1400);
    const d = setTimeout(() => done.current?.(), 2300);
    return () => {
      clearInterval(t);
      clearTimeout(l);
      clearTimeout(d);
    };
  }, []);
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6 text-center md:gap-6 ${dark ? "bg-ink text-ink-foreground" : "bg-background text-foreground"} ${leaving ? "animate-curtain" : ""}`}
    >
      <span className="micro tabular-nums text-muted-foreground">Carregando — {pct}%</span>
      {title ?? <span className="micro animate-fade">{TAGLINE}</span>}
    </div>
  );
}
