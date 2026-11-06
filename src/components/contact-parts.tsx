import { useEffect, useRef, useState } from "react";
import { EMAIL, SITE, WHATSAPP_HREF } from "@/lib/site";

const rowClass =
  "group relative grid w-full min-w-0 grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 overflow-hidden px-3 py-4 text-left md:grid-cols-[8rem_1fr_auto] md:px-4 md:py-5";

const fillBase =
  "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none";

/** Rows light up in the accent on hover; the WhatsApp button goes dark instead. */
const fillClass = `${fillBase} bg-accent`;

const labelClass = "micro relative col-span-2 uppercase text-foreground/70 md:col-span-1";

const valueClass = "relative truncate text-lg font-medium tracking-[-0.03em] md:text-2xl";

const hintClass = "micro relative";

/** Opens a WhatsApp conversation with a greeting already typed. Renders nothing without a number. */
export function WhatsAppCta() {
  if (!WHATSAPP_HREF) return null;
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden bg-accent px-6 py-8 text-accent-foreground md:px-10 md:py-12"
    >
      <span aria-hidden className={`${fillBase} bg-ink`} />
      <span className="relative flex items-end justify-between gap-6 transition-colors duration-500 group-hover:text-accent group-focus-visible:text-accent">
        <span className="text-4xl font-medium leading-none tracking-[-0.05em] md:text-6xl">
          <span className="display-serif">Chamar</span> no WhatsApp
        </span>
        <span aria-hidden className="text-3xl leading-none md:text-5xl">
          ↗
        </span>
      </span>
      <span className="micro relative mt-4 block uppercase text-accent-foreground/70 transition-colors duration-500 group-hover:text-accent/70 group-focus-visible:text-accent/70">
        {SITE.whatsappDisplay} · abre a conversa
      </span>
      <span className="sr-only">(abre em uma nova aba)</span>
    </a>
  );
}

/** A row that copies the e-mail address; it never opens a mail client. Renders nothing without an address. */
export function CopyEmailRow() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!EMAIL) return null;
  const copy = () => {
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };
  return (
    <li className="border-b border-border">
      <button
        type="button"
        onClick={copy}
        className={rowClass}
        aria-label={`Copiar e-mail ${EMAIL}`}
      >
        <span aria-hidden className={fillClass} />
        <span className={labelClass}>E-mail</span>
        <span className={valueClass}>{EMAIL}</span>
        <span aria-hidden className={`${hintClass} uppercase`}>
          {copied ? "Copiado" : "Copiar"}
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Endereço de e-mail copiado para a área de transferência" : ""}
      </span>
    </li>
  );
}

export function LinkRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <li className="border-b border-border">
      <a href={href} target="_blank" rel="noreferrer" className={rowClass}>
        <span aria-hidden className={fillClass} />
        <span className={labelClass}>{label}</span>
        <span className={valueClass}>{value}</span>
        <span aria-hidden className={hintClass}>
          ↗
        </span>
        <span className="sr-only">(abre em uma nova aba)</span>
      </a>
    </li>
  );
}
