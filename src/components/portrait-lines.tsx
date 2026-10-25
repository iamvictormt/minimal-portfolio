import { useEffect, useRef, useState } from "react";

/**
 * The portrait, rebuilt as a cloud of line segments.
 *
 * The drawing's white pixels become particles. They fly in from outside and snap into the face with
 * motion streaks, then the face behaves like a shallow 3D mask: the pointer turns it, scrolling spins it,
 * the cursor pushes the lines away, and a click shatters and rebuilds it. Without motion (or before the
 * script runs) the plain image is shown.
 */

const SAMPLE = 520; // working resolution of the source image
const MAX_POINTS = 14000;
const BUILD_SECONDS = 1.6;
const REPEL_RADIUS = 70; // CSS px

type Particle = {
  /** Target in the face's own space, centered on 0 (−0.5..0.5), plus a slight relief depth. */
  tx: number;
  ty: number;
  tz: number;
  /** Where the particle starts when the face is scattered, as a 0..1 fraction of the canvas. */
  sx: number;
  sy: number;
  /** 0..~0.45: how long this particle waits before it starts flying in. */
  delay: number;
  /** Pointer push, as an offset that springs back to zero. */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  /** Last drawn position, for the streak, and depth bucket for brightness. */
  px: number;
  py: number;
  x: number;
  y: number;
  bucket: number;
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

function sampleParticles(img: HTMLImageElement): Particle[] {
  const off = document.createElement("canvas");
  off.width = SAMPLE;
  off.height = SAMPLE;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

  const hits: number[] = [];
  for (let i = 0; i < SAMPLE * SAMPLE; i++) {
    if ((data[i * 4] ?? 0) > 110) hits.push(i);
  }
  const keep = Math.min(1, MAX_POINTS / Math.max(1, hits.length));

  const out: Particle[] = [];
  for (const i of hits) {
    if (Math.random() > keep) continue;
    const nx = (i % SAMPLE) / SAMPLE - 0.5;
    const ny = Math.floor(i / SAMPLE) / SAMPLE - 0.5;
    // The drawing stays a flat sheet; only the middle of the face rises a touch, so turning it reads as
    // depth without ever bending the outline into a ball.
    const r2 = (nx * nx + (ny + 0.04) * (ny + 0.04) * 1.2) / 0.05;
    const dome = Math.exp(-r2) * 0.07;
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.7 + Math.random() * 0.5;
    out.push({
      tx: nx,
      ty: ny,
      tz: dome + (Math.random() - 0.5) * 0.008,
      sx: 0.5 + Math.cos(angle) * radius,
      sy: 0.5 + Math.sin(angle) * radius,
      delay: Math.random() * 0.45,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      px: 0,
      py: 0,
      x: 0,
      y: 0,
      bucket: 1,
    });
  }
  return out;
}

export function PortraitLines({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let alive = true;
    let raf = 0;
    let visible = false;
    let started = false;
    let particles: Particle[] = [];
    let W = 0;
    let dpr = 1;
    let asm = 0; // 0 scattered → 1 assembled
    let rotY = 0;
    let rotX = 0;
    let aimY = 0;
    let aimX = 0;
    // Scrolling spins the face: a swirl proportional to scroll speed that settles back, plus (on phones,
    // where the portrait moves up the screen) a turn that follows its position in the viewport.
    let lastY = window.scrollY;
    let swirl = 0;
    const phone = !window.matchMedia("(min-width: 768px)").matches;
    let pointer: { x: number; y: number } | null = null;
    let last = performance.now();

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(el.clientWidth * dpr));
      cv.width = W;
      cv.height = W;
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      aimY = clamp(
        ((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)) * 0.4,
        -0.4,
        0.4,
      );
      aimX = clamp(
        ((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)) * 0.2,
        -0.18,
        0.18,
      );
      const inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer = inside ? { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr } : null;
    };
    const onLeave = () => {
      pointer = null;
    };
    const rebuild = () => {
      asm = 0;
      for (const p of particles) {
        p.ox = p.oy = p.vx = p.vy = 0;
        p.px = p.sx * W;
        p.py = p.sy * W;
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive || !visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      asm = Math.min(1, asm + dt / BUILD_SECONDS);
      swirl *= 0.93;
      const box2 = el.getBoundingClientRect();
      const follow = phone
        ? clamp(
            ((box2.top + box2.height / 2 - window.innerHeight / 2) / window.innerHeight) * 0.7,
            -0.35,
            0.35,
          )
        : 0;
      const scrollSpin = follow + swirl;
      rotY += (clamp(aimY + scrollSpin, -0.5, 0.5) - rotY) * 0.08;
      rotX += (aimX - rotX) * 0.08;
      const cY = Math.cos(rotY);
      const sY = Math.sin(rotY);
      const cX = Math.cos(rotX);
      const sX = Math.sin(rotX);
      const radius = REPEL_RADIUS * dpr;

      for (const p of particles) {
        const local = clamp((asm - p.delay) / (1 - p.delay));
        const e = 1 - Math.pow(1 - local, 3);

        const x3 = p.tx * cY + p.tz * sY;
        const z3 = -p.tx * sY + p.tz * cY;
        const y3 = p.ty * cX - z3 * sX;
        const z4 = p.ty * sX + z3 * cX;
        const f = 1 / (1 - z4 * 0.5);
        const rx = (x3 * f + 0.5) * W;
        const ry = (y3 * f + 0.5) * W;

        let cx = p.sx * W + (rx - p.sx * W) * e;
        let cy = p.sy * W + (ry - p.sy * W) * e;

        if (pointer && local > 0.98) {
          const dx = cx + p.ox - pointer.x;
          const dy = cy + p.oy - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius * radius && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = (1 - d / radius) * 2.2 * dpr;
            p.vx += (dx / d) * push;
            p.vy += (dy / d) * push;
          }
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.ox = (p.ox + p.vx) * 0.93;
        p.oy = (p.oy + p.vy) * 0.93;
        cx += p.ox;
        cy += p.oy;

        p.x = cx;
        p.y = cy;
        // Full brightness at rest; the side that turns away from the viewer dims.
        p.bucket = z4 < -0.045 ? 0 : z4 < -0.015 ? 1 : 2;
      }

      ctx.clearRect(0, 0, W, W);
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(1, (W / SAMPLE) * 1.35);
      const alphas = [0.4, 0.72, 1];
      for (let b = 0; b < 3; b++) {
        ctx.strokeStyle = `rgba(255,255,255,${alphas[b]})`;
        ctx.beginPath();
        for (const p of particles) {
          if (p.bucket !== b) continue;
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x + 0.01, p.y);
        }
        ctx.stroke();
      }
      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;
      }
      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf && alive && visible && started) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible && started && asm === 0) rebuild();
      kick();
    });
    const ro = new ResizeObserver(() => {
      resize();
      for (const p of particles) {
        p.px = p.x = p.sx * W;
        p.py = p.y = p.sy * W;
      }
    });

    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      particles = sampleParticles(img);
      if (particles.length === 0) return;
      resize();
      rebuild();
      started = true;
      setRunning(true);
      io.observe(el);
      ro.observe(el);
      kick();
    };
    img.src = src;

    const onScroll = () => {
      const y = window.scrollY;
      swirl = clamp(swirl + (y - lastY) * 0.003, -0.45, 0.45);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", rebuild);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", rebuild);
    };
  }, [src]);

  return (
    <div
      ref={box}
      className="relative aspect-square w-full cursor-crosshair overflow-hidden bg-black"
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        fetchPriority="high"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${running ? "opacity-0" : "opacity-100"}`}
      />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  );
}
