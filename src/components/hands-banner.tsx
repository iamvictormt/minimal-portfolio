import { useEffect, useRef, useState } from "react";

/**
 * Two hands reaching for a PROJECT.EXE window, drawn with #303030 squares on the page background.
 * Moving over it blows the squares apart; each one flies back and the picture rebuilds a second later.
 */

/** Source pixels per square. 1 keeps the picture's own dithering, so thin fingers and the gaps between them survive. */
const SOURCE_STEP = 1;
const BAND = 0.37; // height of the crop, as a fraction of the source image
const CENTER_Y = 0.519; // where the crop is centered vertically
const MAX_POINTS = 120000;
const REBUILD_MS = 1000;
const HIT_RADIUS = 78; // CSS px

type Dot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  /** The dot ignores its home until this timestamp. */
  free: number;
  /** Side of the square, in canvas pixels. */
  s: number;
  /** Awake dots are simulated and drawn every frame; the rest sit on the static layer. */
  awake: boolean;
};

/** Share of the squares that fly in from random places on load. The rest are already home, which keeps the first frames light. */
const FLY_IN_SHARE = 0.3;
const INK = "#303030";
/** Brightness (0-255) a source pixel needs to become a square. Half brightness: the picture is pure black and white. */
const LIT = 120;

export function HandsBanner({
  src,
  alt,
  cta,
}: {
  src: string;
  alt: string;
  cta?: { label: string; action: string; href: string; external?: boolean };
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLCanvasElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const bv = base.current;
    const cv = canvas.current;
    const bctx = bv?.getContext("2d");
    const ctx = cv?.getContext("2d");
    if (!el || !bv || !cv || !bctx || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let visible = false;
    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let dots: Dot[] = [];
    /** Dots that have been disturbed (or are flying in) and are not home yet. */
    let awake: Dot[] = [];
    /** The moving layer still shows something that has to be cleared. */
    let dirty = false;
    let img: HTMLImageElement | null = null;
    let pointer: { x: number; y: number } | null = null;
    let previous: { x: number; y: number } | null = null;
    let burst: { x: number; y: number; r: number } | null = null;

    /** The static layer: every dot that is home. */
    const paintBase = () => {
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = INK;
      for (const d of dots) if (!d.awake) bctx.fillRect(d.tx - d.s / 2, d.ty - d.s / 2, d.s, d.s);
    };

    /** Dots are stored row by row, so the first one at or below a given y can be found by bisection. */
    const firstAtOrBelow = (y: number) => {
      let lo = 0;
      let hi = dots.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if ((dots[mid]?.ty ?? Infinity) < y) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };

    /** Redraws a patch of the static layer from the dots that are home, so a woken dot leaves no ghost edge behind. */
    const repaintBase = (x0: number, y0: number, x1: number, y1: number) => {
      const pad = 2;
      bctx.clearRect(x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2);
      bctx.fillStyle = INK;
      for (let i = firstAtOrBelow(y0 - pad - 2); i < dots.length; i++) {
        const d = dots[i];
        if (!d || d.ty > y1 + pad + 2) break;
        if (d.awake || d.tx < x0 - pad - 2 || d.tx > x1 + pad + 2) continue;
        bctx.fillRect(d.tx - d.s / 2, d.ty - d.s / 2, d.s, d.s);
      }
    };

    /** The moving layer: only the dots that are away from home. */
    const paintAwake = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = INK;
      for (const d of awake) ctx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
    };

    const build = (flyIn: boolean) => {
      if (!img || W === 0) return;
      const aspect = W / H;
      // Whole source pixels, so the 1:1 copy below is not resampled.
      const srcH = Math.round(img.height * BAND);
      const srcW = Math.floor(Math.min(img.width, srcH * aspect));
      const sx = Math.max(0, Math.round(img.width / 2 - srcW / 2));
      const sy = Math.max(0, Math.round(img.height * CENTER_Y - srcH / 2));
      const cols = Math.max(1, Math.floor(srcW / SOURCE_STEP));
      const rows = Math.max(1, Math.floor(srcH / SOURCE_STEP));

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, sx, sy, srcW, srcH, 0, 0, cols, rows);
      const { data } = o.getImageData(0, 0, cols, rows);

      const cell = W / cols;
      const hits: number[] = [];
      for (let i = 0; i < cols * rows; i++) {
        if ((data[i * 4] ?? 0) > LIT) hits.push(i);
      }
      const keep = Math.min(1, MAX_POINTS / Math.max(1, hits.length));

      const now = performance.now();
      const side = Math.max(1.2, cell * 1.02);
      const next: Dot[] = [];
      const flying: Dot[] = [];
      for (const i of hits) {
        if (Math.random() > keep) continue;
        const tx = ((i % cols) + 0.5) * cell;
        const ty = (Math.floor(i / cols) + 0.5) * cell;
        const fly = flyIn && !still && Math.random() < FLY_IN_SHARE;
        const d: Dot = {
          tx,
          ty,
          x: fly ? Math.random() * W : tx,
          y: fly ? Math.random() * H : ty,
          vx: 0,
          vy: 0,
          free: fly ? now + Math.random() * 700 : 0,
          s: side,
          awake: fly,
        };
        next.push(d);
        if (fly) flying.push(d);
      }
      dots = next;
      awake = flying;
      dirty = true;
      paintBase();
      paintAwake();
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive || !visible) return;
      const radius = HIT_RADIUS * dpr;

      // Segment the pointer travelled since the last frame, so quick sweeps do not skip dots.
      const seg =
        pointer && previous
          ? { ax: previous.x, ay: previous.y, bx: pointer.x, by: pointer.y }
          : null;
      const hit = (x: number, y: number, r: number) => {
        if (burst) {
          const dx = x - burst.x;
          const dy = y - burst.y;
          if (dx * dx + dy * dy < burst.r * burst.r) return burst;
        }
        if (!pointer) return null;
        const ax = seg ? seg.ax : pointer.x;
        const ay = seg ? seg.ay : pointer.y;
        const bx = pointer.x;
        const by = pointer.y;
        const abx = bx - ax;
        const aby = by - ay;
        const len2 = abx * abx + aby * aby;
        const t =
          len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * abx + (y - ay) * aby) / len2));
        const px = ax + abx * t;
        const py = ay + aby * t;
        const dx = x - px;
        const dy = y - py;
        return dx * dx + dy * dy < r * r ? { x: px, y: py, r } : null;
      };

      const push = (d: Dot, h: { x: number; y: number }) => {
        const dx = d.x - h.x;
        const dy = d.y - h.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const power = (3 + Math.random() * 11) * dpr;
        d.vx += (dx / dist) * power + (Math.random() - 0.5) * 6 * dpr;
        d.vy += (dy / dist) * power + (Math.random() - 0.5) * 6 * dpr;
        d.free = now + REBUILD_MS;
      };

      // Wake the dots the pointer (or a click burst) touches. Only a bounding box is scanned.
      if (pointer || burst) {
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        const grow = (x: number, y: number, r: number) => {
          x0 = Math.min(x0, x - r);
          y0 = Math.min(y0, y - r);
          x1 = Math.max(x1, x + r);
          y1 = Math.max(y1, y + r);
        };
        if (pointer) {
          grow(pointer.x, pointer.y, radius);
          if (previous) grow(previous.x, previous.y, radius);
        }
        if (burst) grow(burst.x, burst.y, burst.r);
        let woke = false;
        for (let i = firstAtOrBelow(y0); i < dots.length; i++) {
          const d = dots[i];
          if (!d || d.ty > y1) break;
          if (d.awake || d.tx < x0 || d.tx > x1) continue;
          const h = hit(d.tx, d.ty, radius);
          if (!h) continue;
          // From here the dot is simulated like any other awake dot.
          d.awake = true;
          awake.push(d);
          push(d, h);
          woke = true;
        }
        if (woke) repaintBase(x0, y0, x1, y1);
        // Dots already in flight can be hit again.
        for (const d of awake) {
          if (d.free > now + REBUILD_MS - 1) continue; // just pushed above
          const h = hit(d.x, d.y, radius);
          if (h) push(d, h);
        }
      }

      for (let i = awake.length - 1; i >= 0; i--) {
        const d = awake[i];
        if (!d) continue;
        if (now < d.free) {
          d.vx *= 0.96;
          d.vy *= 0.96;
        } else {
          d.vx += (d.tx - d.x) * 0.085;
          d.vy += (d.ty - d.y) * 0.085;
          d.vx *= 0.76;
          d.vy *= 0.76;
        }
        d.x += d.vx;
        d.y += d.vy;
        const settled =
          now >= d.free &&
          Math.abs(d.vx) + Math.abs(d.vy) <= 0.05 &&
          Math.abs(d.tx - d.x) + Math.abs(d.ty - d.y) <= 0.4;
        if (settled) {
          // Home again: back onto the static layer.
          d.awake = false;
          d.x = d.tx;
          d.y = d.ty;
          bctx.fillStyle = INK;
          bctx.fillRect(d.tx - d.s / 2, d.ty - d.s / 2, d.s, d.s);
          const last = awake.pop();
          if (last && last !== d) awake[i] = last;
        }
      }

      previous = pointer ? { ...pointer } : null;
      burst = null;
      if (awake.length > 0 || dirty) {
        paintAwake();
        dirty = awake.length > 0;
      }
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && alive && visible && !still) raf = requestAnimationFrame(frame);
    };

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(el.clientWidth * dpr));
      H = Math.max(1, Math.round(el.clientHeight * dpr));
      cv.width = W;
      cv.height = H;
      bv.width = W;
      bv.height = H;
    };

    const ro = new ResizeObserver(() => {
      if (!img) return;
      size();
      build(false);
    });
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      kick();
    });

    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
    };
    const onMove = (e: PointerEvent) => {
      pointer = local(e);
      kick();
    };
    const onLeave = () => {
      pointer = null;
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      burst = { ...p, r: HIT_RADIUS * 2.2 * dpr };
      kick();
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointerdown", onDown);

    const image = new Image();
    image.onload = () => {
      if (!alive) return;
      img = image;
      size();
      build(true);
      setReady(true);
      ro.observe(el);
      io.observe(el);
      kick();
    };
    image.src = src;

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("pointerdown", onDown);
    };
  }, [src]);

  return (
    <>
      <div
        ref={wrap}
        className="relative aspect-[8/5] w-full overflow-hidden bg-background md:aspect-[27/10]"
      >
        <img
          src={src}
          alt={alt}
          width={1080}
          height={1080}
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover mix-blend-multiply invert transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        <canvas
          ref={base}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 h-full w-full cursor-crosshair touch-pan-y"
        />
        {cta ? (
          // Sits inside the drawn PROJECT.EXE window (37–68% across, 21–75% down of the desktop crop).
          <div className="pointer-events-none absolute left-[37.4%] top-[21%] hidden h-[53.5%] w-[30.2%] items-start justify-center pt-[1.2%] md:flex">
            <a
              href={cta.href}
              {...(cta.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="pointer-events-auto flex flex-col gap-0.5 border border-ink bg-accent px-4 py-2 text-center text-[clamp(0.7rem,1.05vw,1rem)] font-medium leading-snug text-accent-foreground transition-colors duration-300 hover:bg-ink hover:text-accent focus-visible:bg-ink focus-visible:text-accent motion-reduce:transition-none"
            >
              <span>{cta.label}</span>
              <span className="micro uppercase opacity-70">{cta.action}</span>
              {cta.external ? <span className="sr-only">(abre em uma nova aba)</span> : null}
            </a>
          </div>
        ) : null}
      </div>
      {cta ? (
        <a
          href={cta.href}
          {...(cta.external ? { target: "_blank", rel: "noreferrer" } : {})}
          className="group flex items-center justify-between gap-4 bg-accent px-6 py-5 text-accent-foreground md:hidden"
        >
          <span className="text-lg font-medium leading-snug tracking-[-0.02em]">{cta.label}</span>
          <span className="micro shrink-0 uppercase">{cta.action}</span>
          {cta.external ? <span className="sr-only">(abre em uma nova aba)</span> : null}
        </a>
      ) : null}
    </>
  );
}
