# Victor Monteiro — Portfólio

Portfólio de Victor Monteiro, desenvolvedor full stack de Anápolis, Goiás. Em produção em
[eu-victor.vercel.app](https://eu-victor.vercel.app).

## Páginas

| Rota          | Conteúdo                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| `/`           | Apresentação, objeto 3D com as camadas de uma aplicação e projetos recentes |
| `/works`      | Todos os projetos, com captura de tela no hover                             |
| `/about`      | Sobre mim, com o retrato que se reconstrói em linhas                        |
| `/playground` | Laboratório: pequenas ferramentas e brincadeiras                            |
| `/contact`    | Contato (WhatsApp, e-mail para copiar e redes)                              |

`/robots.txt` e `/sitemap.xml` são gerados pelo próprio app.

## Desenvolvimento

Requer Node.js e npm.

```sh
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm test         # testes
npm run lint     # ESLint
```

## Onde editar

- **Meus dados** (nome, e-mail, WhatsApp, redes, cidade, endereço do site): `src/lib/site.ts`
- **Projetos** (nome, descrição, atuação, stack, link e captura): `src/lib/projects.ts`, com as imagens em `src/assets/projects/`
- **SEO** (títulos, descrições, Open Graph, dados estruturados): `src/lib/seo.ts`, e `public/og.jpg` para a imagem de compartilhamento
- **Cores e animações**: `src/styles.css`

## Tecnologias

TanStack Start, React 19, TypeScript, Tailwind CSS 4 e Vite.
