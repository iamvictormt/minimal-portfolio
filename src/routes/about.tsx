import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import portrait from "@/assets/portrait.webp";
import { FULL_NAME, LOCATION_LONG, LOCATION_SHORT, SITE } from "@/lib/site";
import { Loader, NavRow, TAGLINE, TopBar, PageTitle } from "@/components/site-chrome";
import { PortraitLines } from "@/components/portrait-lines";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      path: "/about",
      title: `Sobre — ${FULL_NAME}`,
      description: `Sou ${FULL_NAME}, desenvolvedor full stack de ${LOCATION_LONG}. Front-end, back-end e APIs, banco de dados e deploy.`,
    }),
  component: About,
});

const skills = ["Front-end", "Back-end e APIs", "Banco de dados", "DevOps e deploy"];

function About() {
  const [loading, setLoading] = useState(true);
  return (
    <main className="flex min-h-screen flex-col">
      {loading && (
        <Loader
          dark
          onDone={() => setLoading(false)}
          title={
            <span className="text-7xl font-medium tracking-[-0.05em] md:text-9xl">
              <span className="display-serif">S</span>obre
            </span>
          }
        />
      )}
      <TopBar />
      <PageTitle italic="Sobre">Mim</PageTitle>
      <div className="mt-8">
        <NavRow />
      </div>

      <section className="px-page grid grid-cols-1 gap-14 py-12 md:grid-cols-[5fr_7fr] md:gap-20 md:py-16">
        <figure className="md:sticky md:top-6 md:self-start">
          <div className="mx-auto w-full max-w-md md:max-w-none">
            <PortraitLines
              src={portrait}
              alt="Retrato ilustrado em traço branco contínuo, sobre fundo preto"
              width={1254}
              height={1254}
            />
          </div>
          <figcaption className="micro mt-3 flex flex-wrap justify-between gap-x-4 uppercase text-muted-foreground">
            <span>
              {FULL_NAME} — {LOCATION_SHORT}
            </span>
            <span>Mova o mouse, role ou clique</span>
          </figcaption>
        </figure>

        <div className="flex flex-col">
          <p className="text-balance text-[8.5vw] font-medium leading-[1.05] tracking-[-0.04em] md:text-[3.4vw]">
            Sou {FULL_NAME}, <span className="display-serif">desenvolvedor full stack</span> de{" "}
            {SITE.city}, {SITE.stateName}.
          </p>
          <p className="mt-8 max-w-[34rem] text-base leading-relaxed md:mt-10 md:text-lg">
            Construo produtos web de ponta a ponta, do banco de dados à interface, e acompanho cada
            projeto do primeiro rascunho até o deploy.
          </p>

          <h2 className="micro mb-4 mt-16 uppercase text-muted-foreground md:mt-24">
            O que eu faço
          </h2>
          <ul className="border-t border-foreground/15 [&:hover>li:not(:hover)]:opacity-30">
            {skills.map((s, i) => (
              <li
                key={s}
                className="group border-b border-foreground/15 transition-opacity duration-300"
              >
                <div className="grid grid-cols-[2rem_1fr] items-baseline gap-3 py-4 md:grid-cols-[3rem_1fr] md:py-5">
                  <span className="micro text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-3xl font-medium leading-none tracking-[-0.05em] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-3 motion-reduce:transition-none md:text-5xl">
                    <span className="display-serif">{s.slice(0, 1)}</span>
                    {s.slice(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/contact"
            className="group mt-16 inline-block self-start text-[11vw] leading-none md:mt-24 md:text-[5vw]"
          >
            <span className="display-serif">Fale</span>{" "}
            <span className="font-medium tracking-[-0.04em]">comigo</span>{" "}
            <span className="inline-block font-medium transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-3 motion-reduce:transition-none">
              →
            </span>
          </Link>
          <p className="lede mt-4 uppercase text-muted-foreground">
            Aberto a colaborações e propostas
          </p>
        </div>
      </section>

      <footer className="micro mt-auto pb-5 text-center">{TAGLINE}</footer>
    </main>
  );
}
