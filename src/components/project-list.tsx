import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { PROJECT_IMAGE_SIZE, projects, type Project } from "@/lib/projects";

const PREVIEW_W = 416; // 26rem
const PREVIEW_H = 260;

const rowClass =
  "group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-3 px-page py-6 md:grid-cols-[4rem_1fr_13rem_17rem]";

function Row({
  project: p,
  children,
  ...handlers
}: { project: Project; children: ReactNode } & RowHandlers) {
  if (p.href) {
    return (
      <a href={p.href} target="_blank" rel="noreferrer" className={rowClass} {...handlers}>
        {children}
        <span className="sr-only">(abre em uma nova aba)</span>
      </a>
    );
  }
  return (
    <Link to={p.to ?? "/"} className={rowClass} {...handlers}>
      {children}
    </Link>
  );
}

type RowHandlers = {
  onMouseEnter: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

export function ProjectList({ limit }: { limit?: number }) {
  const items = limit ? projects.slice(0, limit) : projects;
  const [active, setActive] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // The preview only gets a position once the pointer has moved (always on the client), so the server
  // render and the first client render agree. It then keeps its last position while it fades out,
  // instead of jumping to the corner.
  const placed = pos.x !== 0 || pos.y !== 0;
  const flip = placed && pos.x + 24 + PREVIEW_W > window.innerWidth;
  const left = !placed ? 0 : flip ? pos.x - 24 - PREVIEW_W : pos.x + 24;
  const top = !placed
    ? 0
    : Math.min(Math.max(pos.y - PREVIEW_H / 2, 12), window.innerHeight - PREVIEW_H - 12);

  return (
    <>
      <ul
        className="relative border-t border-foreground/15"
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setActive(null)}
      >
        {items.map((p, i) => (
          <li
            key={p.name}
            className={`border-b border-foreground/15 transition-opacity duration-300 ${active !== null && active !== i ? "opacity-30" : ""}`}
          >
            <Row
              project={p}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="micro text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex items-baseline gap-3 text-4xl font-medium leading-none tracking-[-0.05em] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-4 group-focus-visible:translate-x-4 motion-reduce:transition-none md:text-6xl">
                <span>
                  <span className="display-serif">{p.name.slice(0, 1)}</span>
                  {p.name.slice(1)}
                </span>
                <span aria-hidden className="text-xl md:text-3xl">
                  {p.href ? "↗" : "→"}
                </span>
              </span>
              <span className="micro hidden uppercase md:block">{p.type}</span>
              <span className="micro hidden uppercase text-muted-foreground md:block">
                {p.role ?? p.stack.join(" · ")}
              </span>
              <span className="sr-only md:sr-only">{p.description}</span>
              <span className="col-span-full mt-2 flex flex-col gap-3 md:hidden">
                <img
                  src={p.image}
                  alt={`Captura de tela do projeto ${p.name}`}
                  width={PROJECT_IMAGE_SIZE.width}
                  height={PROJECT_IMAGE_SIZE.height}
                  loading="lazy"
                  className="h-auto w-full border border-foreground/15"
                />
                <span className="text-base leading-relaxed text-muted-foreground">
                  {p.description}
                </span>
                <span className="micro uppercase">
                  <span className="text-foreground">{p.type}</span>
                  <span className="text-muted-foreground"> · {p.stack.join(" · ")}</span>
                </span>
              </span>
            </Row>
          </li>
        ))}
      </ul>

      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden transition-[opacity,scale] duration-300 md:block"
        style={{
          width: PREVIEW_W,
          transform: `translate3d(${left}px, ${top}px, 0)`,
          opacity: active === null ? 0 : 1,
          scale: active === null ? "0.92" : "1",
        }}
      >
        <div
          className="relative overflow-hidden border border-foreground/15 bg-ink"
          style={{ height: PREVIEW_H }}
        >
          {items.map((p, i) => (
            <img
              key={p.name}
              src={p.image}
              alt=""
              width={PROJECT_IMAGE_SIZE.width}
              height={PROJECT_IMAGE_SIZE.height}
              className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300"
              style={{ opacity: active === i ? 1 : 0 }}
            />
          ))}
        </div>
        <p className="micro mt-2 bg-background/90 py-1 uppercase">
          {active !== null ? items[active]?.stack.join(" · ") : ""}
        </p>
      </div>
    </>
  );
}
