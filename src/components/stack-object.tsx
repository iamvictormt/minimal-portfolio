import { useEffect, useRef } from "react";

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

export const LAYERS = [
  { label: "Front-end", Art: FrontEndArt },
  { label: "API", Art: ApiArt },
  { label: "Banco de dados", Art: DatabaseArt },
  { label: "Deploy", Art: DeployArt },
] as const;

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * The four layers of a full stack app as stacked plates. `stage` (0 to 3) says which layer is in front:
 * each plate before it lifts away and fades, and the stack turns a little. The pointer tilts the whole thing.
 */
export function StackObject({ stage }: { stage: number }) {
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = tilt.current;
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
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const active = Math.min(LAYERS.length - 1, Math.max(0, Math.round(stage)));
  const current = LAYERS[active] ?? LAYERS[0];

  return (
    <div className="mx-auto w-full max-w-[15rem] md:max-w-none">
      <div
        role="img"
        aria-label={`Camadas de uma aplicação full stack: ${LAYERS.map((l) => l.label).join(", ")}`}
        className="relative aspect-[5/4] w-full"
        style={{ perspective: "1400px" }}
      >
        <div
          ref={tilt}
          className="absolute inset-[11%] md:transition-transform md:duration-200 md:ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform:
              "rotateX(calc(58deg + var(--my, 0) * -9deg)) rotateZ(calc(var(--mx, 0) * 14deg))",
          }}
        >
          <div
            className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
            style={{ transformStyle: "preserve-3d", transform: `rotateZ(${-38 + stage * 7}deg)` }}
          >
            {LAYERS.map((layer, i) => {
              const last = i === LAYERS.length - 1;
              const lift = last ? 0 : clamp(stage - i);
              return (
                <div
                  key={layer.label}
                  aria-hidden
                  className={`absolute inset-0 border border-foreground transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${i === 0 ? "bg-ink text-ink-foreground" : "bg-background text-foreground"}`}
                  style={{
                    transform: `translateZ(${(LAYERS.length - 1 - i) * 2.1 + lift * 14}rem)`,
                    opacity: 1 - lift,
                    boxShadow:
                      "0 1.2rem 2rem -0.8rem color-mix(in oklab, var(--ink) 35%, transparent)",
                    willChange: "transform, opacity",
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
      </div>
      {current ? (
        <p aria-hidden className="micro mt-2 text-center font-mono uppercase text-foreground/70">
          {String(active + 1).padStart(2, "0")} / {String(LAYERS.length).padStart(2, "0")} ·{" "}
          {current.label}
        </p>
      ) : null}
    </div>
  );
}
