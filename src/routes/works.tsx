import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader, NavRow, PageTitle, TAGLINE, TopBar } from "@/components/site-chrome";
import { ProjectList } from "@/components/project-list";
import { FULL_NAME } from "@/lib/site";
import { projectsStructuredData, seo } from "@/lib/seo";

export const Route = createFileRoute("/works")({
  head: () => ({
    ...seo({
      path: "/works",
      title: `Projetos — ${FULL_NAME}`,
      description:
        "Projetos e experimentos de código como desenvolvedor full stack: sites, marketplace, plataformas web e SaaS com Next.js, NestJS e mais.",
    }),
    scripts: [projectsStructuredData()],
  }),
  component: Works,
});

function Works() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="flex min-h-screen flex-col">
      {loading && (
        <Loader
          dark
          onDone={() => setLoading(false)}
          title={
            <span className="text-7xl font-medium tracking-[-0.05em] md:text-9xl">
              <span className="display-serif">T</span>rabalhos
            </span>
          }
        />
      )}
      <TopBar />
      <PageTitle italic="Meus">Projetos</PageTitle>
      <div className="mt-8">
        <NavRow />
      </div>
      <div className="px-page flex flex-col gap-6 pt-12 md:gap-8 md:pt-16">
        <p className="max-w-[60rem] text-balance text-[8.5vw] font-medium leading-[1.05] tracking-[-0.04em] md:text-[3.4vw]">
          Sites, plataformas e produtos que <span className="display-serif">construí</span> de ponta
          a ponta.
        </p>
        <p className="max-w-[34rem] text-base leading-relaxed md:text-lg">
          Passe o mouse sobre um deles para espiar, clique para abrir o
          site.
        </p>
      </div>
      <div className="pb-12 pt-10 md:pb-16 md:pt-14">
        <ProjectList />
      </div>

      <footer className="micro mt-auto pb-5 text-center">{TAGLINE}</footer>
    </main>
  );
}
