import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader, NavRow, PageTitle, TAGLINE, TopBar, useLocalTime } from "@/components/site-chrome";
import { EMAIL, FULL_NAME, LOCATION_LONG, SITE, WHATSAPP_URL } from "@/lib/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      path: "/contact",
      title: `Contato — ${FULL_NAME}`,
      description: `Vamos conversar? Chame no WhatsApp ou fale comigo pelas redes. Sou ${FULL_NAME}, desenvolvedor full stack em ${LOCATION_LONG}.`,
    }),
  component: Contact,
});

const rowClass =
  "group relative grid w-full min-w-0 grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 overflow-hidden px-3 py-4 text-left md:grid-cols-[8rem_1fr_auto] md:px-4 md:py-5";

const fillClass =
  "absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none";

const labelClass =
  "micro relative col-span-2 uppercase text-muted-foreground transition-colors duration-300 group-hover:text-ink-foreground/60 group-focus-visible:text-ink-foreground/60 md:col-span-1";

const valueClass =
  "relative truncate text-lg font-medium tracking-[-0.03em] transition-colors duration-300 group-hover:text-ink-foreground group-focus-visible:text-ink-foreground md:text-2xl";

const hintClass =
  "micro relative transition-colors duration-300 group-hover:text-ink-foreground group-focus-visible:text-ink-foreground";

function LocalClock() {
  const time = useLocalTime();
  return (
    <p className="micro uppercase text-muted-foreground">
      {SITE.city}, {SITE.stateName} ·{" "}
      <span className="tabular-nums text-foreground">{time || "--:--"}</span> ({SITE.utc})
    </p>
  );
}

function WhatsAppCta() {
  const text = `Olá, ${SITE.firstName}! Vim pelo seu portfólio.`;
  return (
    <a
      href={`${WHATSAPP_URL}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden border border-foreground px-6 py-8 md:px-10 md:py-12"
    >
      <span aria-hidden className={fillClass} />
      <span className="relative flex items-end justify-between gap-6 transition-colors duration-500 group-hover:text-ink-foreground group-focus-visible:text-ink-foreground">
        <span className="text-4xl font-medium leading-none tracking-[-0.05em] md:text-6xl">
          <span className="display-serif">Chamar</span> no WhatsApp
        </span>
        <span aria-hidden className="text-3xl leading-none md:text-5xl">
          ↗
        </span>
      </span>
      <span className="micro relative mt-4 block uppercase text-muted-foreground transition-colors duration-500 group-hover:text-ink-foreground/60 group-focus-visible:text-ink-foreground/60">
        {SITE.whatsappDisplay} · abre a conversa
      </span>
      <span className="sr-only">(abre em uma nova aba)</span>
    </a>
  );
}

function CopyEmailRow() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
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
    <li className="border-b border-foreground/15">
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

function LinkRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <li className="border-b border-foreground/15">
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

function Contact() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="flex min-h-screen flex-col">
      {loading && (
        <Loader
          dark
          onDone={() => setLoading(false)}
          title={
            <span className="text-7xl font-medium tracking-[-0.05em] md:text-9xl">
              <span className="display-serif">C</span>ontato
            </span>
          }
        />
      )}
      <TopBar />
      <PageTitle italic="Fale">Comigo</PageTitle>
      <div className="mt-8">
        <NavRow />
      </div>

      <section className="px-page grid grid-cols-1 gap-14 py-12 md:grid-cols-[5fr_7fr] md:gap-20 md:py-16">
        <div className="flex flex-col gap-8 md:sticky md:top-6 md:self-start">
          <p className="text-balance text-[8.5vw] font-medium leading-[1.05] tracking-[-0.04em] md:text-[3.4vw]">
            Tem um projeto em mente <span className="display-serif">ou só quer dizer oi?</span>
          </p>
          <p className="max-w-[26rem] text-base leading-relaxed md:text-lg">
            Por e-mail, respondo em 1–2 dias úteis.
          </p>
          <LocalClock />
        </div>

        <div className="flex flex-col gap-12">
          {WHATSAPP_URL ? <WhatsAppCta /> : null}

          <div>
            <h2 className="micro mb-4 uppercase text-muted-foreground">Outros canais</h2>
            <ul className="border-t border-foreground/15">
              {EMAIL ? <CopyEmailRow /> : null}
              {SITE.socials.map((s) => (
                <LinkRow key={s.label} label={s.label} value={s.display} href={s.href} />
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="micro mt-auto pb-5 text-center">{TAGLINE}</footer>
    </main>
  );
}
