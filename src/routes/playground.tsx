import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Loader, NavRow, PageTitle, TAGLINE, TopBar } from "@/components/site-chrome";
import { FULL_NAME, SITE } from "@/lib/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/playground")({
  head: () =>
    seo({
      path: "/playground",
      title: `Laboratório — ${FULL_NAME}`,
      description:
        "Pequenas ferramentas e brincadeiras que eu faço por diversão: teste de reflexo, divisor de conta, gerador de senha e mais. Todas funcionam na própria página.",
    }),
  component: Playground,
});

const buttonClass =
  "micro border border-foreground px-4 py-2 uppercase transition-colors duration-300 hover:bg-ink hover:text-ink-foreground disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

const fieldClass =
  "w-full border-b border-foreground/30 bg-transparent pb-2 text-xl font-medium tracking-[-0.02em] outline-none transition-colors placeholder:text-foreground/25 focus:border-foreground";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Panel({
  n,
  tag,
  title,
  hint,
  className = "",
  children,
}: {
  n: string;
  tag: string;
  title: string;
  hint: string;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`flex flex-col gap-5 border-b border-r border-foreground/15 p-5 md:p-6 ${className}`}
    >
      <div className="flex items-baseline justify-between">
        <span className="micro text-muted-foreground">{n}</span>
        <span className="micro uppercase text-muted-foreground">{tag}</span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 id={id} className="text-2xl font-medium leading-none tracking-[-0.04em] md:text-3xl">
          {title}
        </h2>
        <p className="max-w-[30rem] text-sm leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  );
}

const pick = (max: number) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return (a[0] ?? 0) % max;
};

/* 01 — Seu nome em linhas ---------------------------------------------------- */

type Dot = { x: number; y: number; tx: number; ty: number; vx: number; vy: number };

function NameLines() {
  const [text, setText] = useState(SITE.firstName);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const textRef = useRef(text);
  const retarget = useRef<() => void>(() => {});
  textRef.current = text;

  useEffect(() => {
    retarget.current();
  }, [text]);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    const still = reducedMotion();
    let alive = true;
    let visible = false;
    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;
    const dots: Dot[] = [];
    let pointer: { x: number; y: number } | null = null;

    const build = () => {
      if (W === 0) return;
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      const label = textRef.current.trim() || " ";
      let size = H * 0.62;
      o.font = `600 ${size}px Manrope, system-ui, sans-serif`;
      const measured = o.measureText(label).width;
      if (measured > W * 0.9) size *= (W * 0.9) / measured;
      o.font = `600 ${size}px Manrope, system-ui, sans-serif`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.fillText(label, W / 2, H / 2);
      const { data } = o.getImageData(0, 0, W, H);
      const step = Math.max(2, Math.round(dpr * 2.2));
      const pts: [number, number][] = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if ((data[(y * W + x) * 4 + 3] ?? 0) > 128) pts.push([x, y]);
        }
      }
      const count = Math.min(3600, Math.max(900, pts.length));
      while (dots.length < count) {
        dots.push({ x: Math.random() * W, y: Math.random() * H, tx: 0, ty: 0, vx: 0, vy: 0 });
      }
      dots.length = count;
      for (const d of dots) {
        const p = pts[Math.floor(Math.random() * pts.length)];
        d.tx = p ? p[0] : W / 2;
        d.ty = p ? p[1] : H / 2;
        if (still) {
          d.x = d.tx;
          d.y = d.ty;
        }
      }
    };
    retarget.current = build;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      const s = Math.max(1.4, dpr * 1.7);
      for (const d of dots) ctx.fillRect(d.x, d.y, s, s);
    };

    const frame = () => {
      raf = 0;
      if (!alive || !visible) return;
      const radius = 70 * dpr;
      for (const d of dots) {
        d.vx += (d.tx - d.x) * 0.055;
        d.vy += (d.ty - d.y) * 0.055;
        if (pointer) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius * radius && d2 > 0.01) {
            const dist = Math.sqrt(d2);
            const push = (1 - dist / radius) * 3.2 * dpr;
            d.vx += (dx / dist) * push;
            d.vy += (dy / dist) * push;
          }
        }
        d.vx *= 0.8;
        d.vy *= 0.8;
        d.x += d.vx;
        d.y += d.vy;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && alive && visible && !still) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(el.clientWidth * dpr));
      H = Math.max(1, Math.round(el.clientHeight * dpr));
      cv.width = W;
      cv.height = H;
      build();
      if (still) draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      kick();
    });
    io.observe(el);
    void (document.fonts?.load("600 100px Manrope") ?? Promise.resolve()).then(() => {
      if (alive) {
        build();
        if (still) draw();
      }
    });

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer = { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
    };
    const onLeave = () => {
      pointer = null;
    };
    const onDown = () => {
      for (const d of dots) {
        d.vx += (Math.random() - 0.5) * 38 * dpr;
        d.vy += (Math.random() - 0.5) * 38 * dpr;
      }
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointerdown", onDown);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const id = useId();
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div ref={wrap} className="relative h-56 w-full overflow-hidden bg-ink md:h-64">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          aria-label={`O texto “${text}” formado por pontos`}
          role="img"
        />
      </div>
      <div>
        <label htmlFor={id} className="micro uppercase text-muted-foreground">
          Escreva uma palavra
        </label>
        <input
          id={id}
          value={text}
          maxLength={16}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          className={`${fieldClass} mt-2`}
        />
      </div>
    </div>
  );
}

/* 02 — Teste de reflexo ----------------------------------------------------- */

type ReflexPhase = "idle" | "wait" | "go" | "early" | "done";

function Reflex() {
  const [phase, setPhase] = useState<ReflexPhase>("idle");
  const [ms, setMs] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("lab-reflex-best"));
      if (saved > 0) setBest(saved);
    } catch {
      /* storage unavailable */
    }
    return () => clearTimeout(timer.current);
  }, []);

  const press = () => {
    if (phase === "idle" || phase === "done" || phase === "early") {
      setPhase("wait");
      timer.current = setTimeout(
        () => {
          startedAt.current = performance.now();
          setPhase("go");
        },
        1500 + Math.random() * 2800,
      );
      return;
    }
    if (phase === "wait") {
      clearTimeout(timer.current);
      setPhase("early");
      return;
    }
    const t = Math.round(performance.now() - startedAt.current);
    setMs(t);
    setPhase("done");
    setBest((b) => {
      const next = b === null || t < b ? t : b;
      try {
        localStorage.setItem("lab-reflex-best", String(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const look: Record<ReflexPhase, { box: string; label: string; sub: string }> = {
    idle: {
      box: "border border-foreground",
      label: "Toque para começar",
      sub: "Quando a caixa ficar clara, toque o mais rápido que puder.",
    },
    wait: { box: "bg-ink text-ink-foreground", label: "Espere…", sub: "Ainda não!" },
    go: { box: "border border-foreground bg-white text-ink", label: "Agora!", sub: "Toque!" },
    early: {
      box: "border border-foreground",
      label: "Cedo demais",
      sub: "Toque para tentar de novo.",
    },
    done: { box: "border border-foreground", label: `${ms} ms`, sub: "Toque para jogar de novo." },
  };
  const current = look[phase];

  return (
    <div className="flex flex-1 flex-col gap-3">
      <button
        type="button"
        onPointerDown={press}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            press();
          }
        }}
        className={`flex h-48 w-full select-none flex-col items-center justify-center gap-2 text-center transition-colors duration-150 motion-reduce:transition-none md:h-56 ${current.box}`}
      >
        <span
          className={`font-medium leading-none tabular-nums tracking-[-0.05em] ${phase === "done" ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"}`}
        >
          {current.label}
        </span>
        <span className="micro uppercase opacity-70">{current.sub}</span>
      </button>
      <p aria-live="polite" className="micro uppercase text-muted-foreground">
        {best !== null ? `Seu melhor tempo: ${best} ms` : "Ainda sem recorde"}
      </p>
    </div>
  );
}

/* 03 — Velocidade de digitação ---------------------------------------------- */

const PHRASES = [
  "A prática leva a gente muito mais longe do que a pressa.",
  "Cada projeto começa com uma ideia e uma tela em branco.",
  "Quem digita devagar chega, quem não digita nunca começa.",
  "O café esfriou, mas a ideia ainda estava quente.",
];

function Typing() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ wpm: number; accuracy: number } | null>(null);
  const startedAt = useRef(0);
  const id = useId();
  const phrase = PHRASES[index % PHRASES.length] ?? "";

  const change = (value: string) => {
    if (result) return;
    const next = value.slice(0, phrase.length);
    if (!typed && next) startedAt.current = performance.now();
    setTyped(next);
    if (next.length === phrase.length) {
      const minutes = Math.max(0.001, (performance.now() - startedAt.current) / 60000);
      const correct = [...next].filter((c, i) => c === phrase[i]).length;
      setResult({
        wpm: Math.round(phrase.length / 5 / minutes),
        accuracy: Math.round((correct / phrase.length) * 100),
      });
    }
  };
  const again = () => {
    setIndex((i) => i + 1);
    setTyped("");
    setResult(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p aria-hidden className="text-xl font-medium leading-snug tracking-[-0.02em] md:text-2xl">
        {[...phrase].map((c, i) => {
          const t = typed[i];
          const cls =
            t === undefined
              ? "text-foreground/30"
              : t === c
                ? "text-foreground"
                : "text-destructive underline";
          return (
            <span key={i} className={cls}>
              {c}
            </span>
          );
        })}
      </p>
      <div>
        <label htmlFor={id} className="micro uppercase text-muted-foreground">
          Digite a frase acima
        </label>
        <input
          id={id}
          value={typed}
          onChange={(e) => change(e.target.value)}
          disabled={result !== null}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Comece a digitar…"
          className={`${fieldClass} mt-2 disabled:opacity-50`}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="micro uppercase text-muted-foreground">
          {result ? (
            <>
              <span className="text-foreground">{result.wpm} palavras por minuto</span> ·{" "}
              {result.accuracy}% de acerto
            </>
          ) : (
            "O tempo começa na primeira letra"
          )}
        </p>
        <button type="button" onClick={again} className={buttonClass}>
          {result ? "Outra frase" : "Trocar frase"}
        </button>
      </div>
    </div>
  );
}

/* 04 — Divida a conta ------------------------------------------------------- */

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function SplitBill() {
  const [total, setTotal] = useState("240");
  const [people, setPeople] = useState(4);
  const [tip, setTip] = useState(10);
  const totalId = useId();

  const amount = Number(total.replace(/\./g, "").replace(",", ".")) || 0;
  const withTip = amount * (1 + tip / 100);
  const each = withTip / people;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <label htmlFor={totalId} className="micro uppercase text-muted-foreground">
          Valor da conta (R$)
        </label>
        <input
          id={totalId}
          value={total}
          onChange={(e) => setTotal(e.target.value.replace(/[^\d.,]/g, ""))}
          inputMode="decimal"
          autoComplete="off"
          className={`${fieldClass} mt-2`}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="micro uppercase text-muted-foreground">Pessoas</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menos uma pessoa"
            onClick={() => setPeople((p) => Math.max(1, p - 1))}
            className={buttonClass}
          >
            −
          </button>
          <span className="w-8 text-center text-2xl font-medium tabular-nums">{people}</span>
          <button
            type="button"
            aria-label="Mais uma pessoa"
            onClick={() => setPeople((p) => Math.min(30, p + 1))}
            className={buttonClass}
          >
            +
          </button>
        </div>
      </div>
      <div role="radiogroup" aria-label="Gorjeta" className="flex flex-wrap items-center gap-2">
        <span className="micro mr-1 uppercase text-muted-foreground">Gorjeta</span>
        {[0, 5, 10, 15].map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={tip === v}
            onClick={() => setTip(v)}
            className={`micro border px-3 py-2 tabular-nums transition-colors duration-300 motion-reduce:transition-none ${tip === v ? "border-foreground bg-ink text-ink-foreground" : "border-foreground/30 hover:border-foreground"}`}
          >
            {v}%
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-auto border-t border-foreground/15 pt-4">
        <p className="micro uppercase text-muted-foreground">Cada um paga</p>
        <p className="text-5xl font-medium leading-none tabular-nums tracking-[-0.05em]">
          {brl.format(each)}
        </p>
        <p className="micro mt-2 uppercase text-muted-foreground">
          Total com gorjeta: {brl.format(withTip)}
        </p>
      </div>
    </div>
  );
}

/* 05 — Senha forte ---------------------------------------------------------- */

const SETS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%&*?-_+=",
};

function makePassword(length: number, opts: { upper: boolean; digits: boolean; symbols: boolean }) {
  const pools = [
    SETS.lower,
    ...(opts.upper ? [SETS.upper] : []),
    ...(opts.digits ? [SETS.digits] : []),
    ...(opts.symbols ? [SETS.symbols] : []),
  ];
  const all = pools.join("");
  const chars = pools.map((p) => p[pick(p.length)] ?? "");
  while (chars.length < length) chars.push(all[pick(all.length)] ?? "");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [chars[i], chars[j]] = [chars[j] ?? "", chars[i] ?? ""];
  }
  return { value: chars.join(""), pool: all.length };
}

function Password() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, digits: true, symbols: true });
  const [result, setResult] = useState<{ value: string; pool: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sliderId = useId();

  useEffect(() => {
    setResult(makePassword(length, opts));
  }, [length, opts]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const bits = result ? Math.round(length * Math.log2(result.pool)) : 0;
  const level = bits < 50 ? 0 : bits < 80 ? 1 : 2;
  const labels = ["Fraca", "Boa", "Muito forte"];

  const copy = () => {
    if (!result) return;
    navigator.clipboard
      .writeText(result.value)
      .then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };

  const toggles: { key: "upper" | "digits" | "symbols"; label: string }[] = [
    { key: "upper", label: "Maiúsculas" },
    { key: "digits", label: "Números" },
    { key: "symbols", label: "Símbolos" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <p
        className="break-all border border-foreground/15 px-3 py-4 font-mono text-lg leading-snug"
        aria-live="polite"
      >
        {result?.value ?? "••••••••••••••••"}
      </p>
      <div>
        <label
          htmlFor={sliderId}
          className="micro flex justify-between uppercase text-muted-foreground"
        >
          <span>Tamanho</span>
          <span className="tabular-nums text-foreground">{length} caracteres</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={8}
          max={32}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--ink)]"
        />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {toggles.map((t) => (
          <label key={t.key} className="micro flex cursor-pointer items-center gap-2 uppercase">
            <input
              type="checkbox"
              checked={opts[t.key]}
              onChange={(e) => setOpts((o) => ({ ...o, [t.key]: e.target.checked }))}
              className="size-4 accent-[var(--ink)]"
            />
            {t.label}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3" aria-live="polite">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 ${i <= level ? "bg-foreground" : "bg-foreground/15"}`}
            />
          ))}
        </div>
        <span className="micro uppercase">{labels[level]}</span>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setResult(makePassword(length, opts))}
          className={buttonClass}
        >
          Gerar outra
        </button>
        <button type="button" onClick={copy} className={buttonClass}>
          {copied ? "Copiada" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

/* 06 — Sorteador ------------------------------------------------------------ */

function Raffle() {
  const [names, setNames] = useState("Ana\nBruno\nCarla\nDiego");
  const [shown, setShown] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  const list = names
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const draw = () => {
    if (list.length < 2 || running) return;
    const chosen = list[pick(list.length)] ?? "";
    setWinner(null);
    setRunning(true);
    if (reducedMotion()) {
      setShown(chosen);
      setWinner(chosen);
      setRunning(false);
      return;
    }
    let delay = 55;
    const tick = () => {
      if (delay > 330) {
        setShown(chosen);
        setWinner(chosen);
        setRunning(false);
        return;
      }
      setShown(list[pick(list.length)] ?? "");
      delay *= 1.14;
      timer.current = setTimeout(tick, delay);
    };
    tick();
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid flex-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor={id} className="micro uppercase text-muted-foreground">
            Um nome por linha
          </label>
          <textarea
            id={id}
            value={names}
            onChange={(e) => {
              setNames(e.target.value);
              setWinner(null);
              setShown("");
            }}
            rows={5}
            className={`${fieldClass} mt-2 flex-1 resize-none border border-foreground/30 p-3 text-base focus:border-foreground`}
          />
        </div>
        <div
          aria-live="polite"
          className="flex min-h-32 flex-col items-center justify-center border border-foreground/15 p-4 text-center"
        >
          <p className="micro uppercase text-muted-foreground">
            {winner ? "Sorteado" : running ? "Sorteando…" : "Quem será?"}
          </p>
          <p
            className={`mt-2 break-words text-4xl leading-none tracking-[-0.04em] md:text-5xl ${winner ? "display-serif" : "font-medium"}`}
          >
            {shown || "—"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="micro uppercase text-muted-foreground">
          {list.length} {list.length === 1 ? "nome" : "nomes"}
        </p>
        <button
          type="button"
          onClick={draw}
          disabled={list.length < 2 || running}
          className={buttonClass}
        >
          Sortear
        </button>
      </div>
    </div>
  );
}

/* 07 — Cara ou coroa --------------------------------------------------------- */

function Coin() {
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<"cara" | "coroa" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [count, setCount] = useState({ cara: 0, coroa: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const flip = () => {
    if (flipping) return;
    const next = pick(2) === 0 ? "cara" : "coroa";
    const finish = () => {
      setResult(next);
      setCount((c) => ({ ...c, [next]: c[next] + 1 }));
      setFlipping(false);
    };
    setFlipping(true);
    setResult(null);
    if (reducedMotion()) {
      setRotation((r) => Math.ceil(r / 360) * 360 + (next === "coroa" ? 180 : 0));
      finish();
      return;
    }
    setRotation((r) => Math.ceil(r / 360) * 360 + 1800 + (next === "coroa" ? 180 : 0));
    timer.current = setTimeout(finish, 1300);
  };

  const face =
    "absolute inset-0 flex items-center justify-center rounded-full border border-foreground [backface-visibility:hidden]";

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-5">
      <div
        className="flex flex-1 items-center justify-center py-2"
        style={{ perspective: "700px" }}
      >
        <div
          className="relative size-32 md:size-36"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation}deg)`,
            transition: reducedMotion() ? "none" : "transform 1.25s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <div className={`${face} bg-ink text-ink-foreground`}>
            <span className="display-serif text-5xl">Cara</span>
          </div>
          <div
            className={`${face} bg-background text-foreground`}
            style={{ transform: "rotateX(180deg)" }}
          >
            <span className="display-serif text-5xl">Coroa</span>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-3">
        <p aria-live="polite" className="micro uppercase text-muted-foreground">
          {result ? (
            <span className="text-foreground">Deu {result}</span>
          ) : flipping ? (
            "Girando…"
          ) : (
            "Jogue a moeda"
          )}{" "}
          · Cara {count.cara} × {count.coroa} Coroa
        </p>
        <button type="button" onClick={flip} disabled={flipping} className={buttonClass}>
          Jogar
        </button>
      </div>
    </div>
  );
}

/* Página -------------------------------------------------------------------- */

function Playground() {
  const [loading, setLoading] = useState(true);
  return (
    <main className="flex min-h-screen flex-col">
      {loading && (
        <Loader
          dark
          onDone={() => setLoading(false)}
          title={
            <span className="text-5xl font-medium tracking-[-0.05em] md:text-8xl">
              <span className="display-serif">L</span>aboratório
            </span>
          }
        />
      )}
      <TopBar />
      <PageTitle italic="Meu">Lab</PageTitle>
      <div className="mt-8">
        <NavRow />
      </div>
      <div className="px-page flex flex-col gap-6 pt-12 md:gap-8 md:pt-16">
        <p className="max-w-[60rem] text-balance text-[8.5vw] font-medium leading-[1.05] tracking-[-0.04em] md:text-[3.4vw]">
          Pequenas ferramentas e <span className="display-serif">brincadeiras</span> que eu faço por
          diversão.
        </p>
        <p className="max-w-[34rem] text-base leading-relaxed md:text-lg">
          Todas funcionam aqui mesmo: é só experimentar.
        </p>
      </div>
      <div className="px-page w-full pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="grid grid-cols-1 border-l border-t border-foreground/15 md:grid-cols-12">
          <Panel
            n="01"
            tag="Visual"
            title="Seu nome em linhas"
            hint="Escreva uma palavra e veja ela se formar com pontos. Passe o mouse por cima para bagunçar, clique para explodir."
            className="md:col-span-7"
          >
            <NameLines />
          </Panel>
          <Panel
            n="02"
            tag="Jogo"
            title="Teste de reflexo"
            hint="Descubra em quantos milissegundos você reage. Uma piscada leva cerca de 300."
            className="md:col-span-5"
          >
            <Reflex />
          </Panel>
          <Panel
            n="03"
            tag="Teste"
            title="Quão rápido você digita?"
            hint="Digite a frase sem pressa e veja quantas palavras por minuto você alcança."
            className="md:col-span-4"
          >
            <Typing />
          </Panel>
          <Panel
            n="04"
            tag="Útil"
            title="Divida a conta"
            hint="Valor, pessoas e gorjeta: quanto cada um paga no fim do jantar."
            className="md:col-span-4"
          >
            <SplitBill />
          </Panel>
          <Panel
            n="05"
            tag="Segurança"
            title="Senha forte"
            hint="Gere uma senha difícil de adivinhar. Ela é criada no seu aparelho e não é enviada para lugar nenhum."
            className="md:col-span-4"
          >
            <Password />
          </Panel>
          <Panel
            n="06"
            tag="Sorte"
            title="Sorteador de nomes"
            hint="Cole os nomes, um por linha, e deixe a sorte escolher."
            className="md:col-span-7"
          >
            <Raffle />
          </Panel>
          <Panel
            n="07"
            tag="Sorte"
            title="Cara ou coroa"
            hint="Na dúvida, a moeda decide."
            className="md:col-span-5"
          >
            <Coin />
          </Panel>
        </div>
      </div>
      <footer className="micro mt-auto pb-5 text-center">{TAGLINE}</footer>
    </main>
  );
}
