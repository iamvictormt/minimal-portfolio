import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader, NavRow, PageTitle, TAGLINE, TopBar, useLocalTime } from "@/components/site-chrome";
import { CopyEmailRow, LinkRow, WhatsAppCta } from "@/components/contact-parts";
import { FULL_NAME, LOCATION_LONG, SITE } from "@/lib/site";
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

function LocalClock() {
  const time = useLocalTime();
  return (
    <p className="micro uppercase text-foreground/70">
      {SITE.city}, {SITE.stateName} ·{" "}
      <span className="tabular-nums text-foreground">{time || "--:--"}</span> ({SITE.utc})
    </p>
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
          <WhatsAppCta />

          <div>
            <h2 className="micro mb-4 uppercase text-foreground/70">Outros canais</h2>
            <ul className="border-t border-border">
              <CopyEmailRow />
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
