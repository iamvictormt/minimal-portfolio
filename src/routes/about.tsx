import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader, NavRow, PageTitle, TAGLINE, TopBar } from "@/components/site-chrome";
import { StackObject } from "@/components/stack-object";
import { seo } from "@/lib/seo";
import { FULL_NAME, LOCATION_LONG, SITE, SKILLS } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      path: "/about",
      title: `Sobre — ${FULL_NAME}`,
      description: `Sou ${FULL_NAME}, desenvolvedor full stack de ${LOCATION_LONG}. Front-end, back-end e APIs, banco de dados e deploy.`,
    }),
  component: About,
});

type Step = {
  title: string;
  /** What this layer is, for someone who does not code. */
  tagline: string;
  text: string;
  tech: string[];
};

const STEPS: Step[] = [
  {
    title: "Front-end",
    tagline: "O que você vê e toca",
    text: "As telas, as animações e os formulários. Cuido para o site ser bonito, rápido e fácil de usar, no celular e no computador.",
    tech: SKILLS.frontend,
  },
  {
    title: "Back-end e APIs",
    tagline: "Onde as regras vivem",
    text: "O que acontece quando você clica em comprar, entrar ou votar: contas de usuário, pagamentos e a conversa com outros sistemas.",
    tech: SKILLS.backend,
  },
  {
    title: "Banco de dados",
    tagline: "Onde tudo fica guardado",
    text: "Usuários, pedidos, rankings e conteúdos guardados com segurança e prontos para serem encontrados em instantes.",
    tech: SKILLS.database,
  },
  {
    title: "DevOps e deploy",
    tagline: "No ar e funcionando",
    text: "Publico o projeto, configuro o servidor e acompanho para que ele continue no ar sem dar trabalho para quem usa.",
    tech: SKILLS.devops,
  },
];

function About() {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // The step crossing the lower-middle of the screen decides which layer is in front.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset["step"]);
          if (!Number.isNaN(i)) setStage(i);
        }
      },
      { rootMargin: "-50% 0px -30% 0px" },
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

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

      <div className="px-page flex flex-col gap-6 pt-12 md:gap-8 md:pt-16">
        <p className="max-w-[60rem] text-balance text-[8.5vw] font-medium leading-[1.05] tracking-[-0.04em] md:text-[3.4vw]">
          Sou {FULL_NAME}, <span className="display-serif">desenvolvedor full stack</span> de{" "}
          {SITE.city}, {SITE.stateName}.
        </p>
        <p className="max-w-[34rem] text-base leading-relaxed md:text-lg">
          Construo produtos web de ponta a ponta, do banco de dados à interface, e acompanho cada
          projeto do primeiro rascunho até o deploy.
        </p>
      </div>

      <section aria-labelledby="how" className="px-page pb-12 pt-16 md:pb-16 md:pt-24">
        <h2 id="how" className="micro mb-6 uppercase text-foreground/70 md:mb-10">
          Como eu trabalho
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[5fr_7fr] md:gap-20">
          <div className="sticky top-3 z-10 self-start bg-background pb-2 md:top-24 md:pb-0">
            <StackObject stage={stage} />
          </div>
          <ol>
            {STEPS.map((step, i) => {
              return (
                <li
                  key={step.title}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  data-step={i}
                  className={`flex min-h-[62svh] flex-col justify-center gap-5 border-t border-border py-10 transition-opacity duration-500 md:min-h-[78svh] ${stage === i ? "opacity-100" : "opacity-35"}`}
                >
                  <span className="micro uppercase text-foreground/70">
                    {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} ·{" "}
                    {step.tagline}
                  </span>
                  <h3 className="text-5xl font-medium leading-none tracking-[-0.05em] md:text-7xl">
                    <span className="display-serif">{step.title.slice(0, 1)}</span>
                    {step.title.slice(1)}
                  </h3>
                  <p className="max-w-[32rem] text-base leading-relaxed md:text-lg">{step.text}</p>
                  <p className="micro flex flex-wrap gap-x-3 gap-y-1 uppercase">
                    {step.tech.map((t) => (
                      <span key={t} className="text-foreground/70">
                        {t}
                      </span>
                    ))}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="px-page flex flex-col items-start gap-4 pb-16 md:pb-24">
        <Link to="/contact" className="group text-[11vw] leading-none md:text-[5vw]">
          <span className="display-serif">Fale</span>{" "}
          <span className="font-medium tracking-[-0.04em]">comigo</span>{" "}
          <span className="inline-block font-medium transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-3 motion-reduce:transition-none">
            →
          </span>
        </Link>
        <p className="lede uppercase text-foreground/70">Aberto a colaborações e propostas</p>
      </section>

      <footer className="micro mt-auto pb-5 text-center">{TAGLINE}</footer>
    </main>
  );
}
