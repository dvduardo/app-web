# app-web

Aplicação web para organizar coleções pessoais. O app permite cadastrar itens, categorias, campos customizados, fotos, favoritos e status de coleção, com autenticação, dashboard responsivo e suporte PWA/offline.

## Destaques

- Dashboard autenticado para criar, editar, filtrar, favoritar e visualizar itens em grade ou lista.
- Autenticação por credenciais e OAuth com Google, GitHub e Discord via NextAuth.
- Gestão por usuário com categorias, campos customizados, status (`owned`, `wishlist`, `loaned`) e soft delete.
- Upload de até 2 fotos por item, com otimização automática e galeria.
- PWA instalável com manifest, ícones, service worker, cache offline e persistência de dados do React Query.
- Testes unitários e E2E com cobertura mínima configurada em 90%.

## Stack

| Área | Tecnologias |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS 4, Lucide React |
| Forms e validação | React Hook Form, Zod |
| Dados | Prisma ORM, PostgreSQL, Axios |
| Estado no cliente | TanStack React Query, persistência em `localStorage` |
| Auth | JWT, cookies HTTP-only, bcryptjs, NextAuth |
| PWA | `@ducanh2912/next-pwa`, Workbox |
| Qualidade | Vitest, Testing Library, Playwright, ESLint |

## Screenshots

| Login | Dashboard |
| --- | --- |
| ![Login](img/login-desktop.png) | ![Dashboard](img/dashboard-desktop.png) |

| Novo item | Mobile |
| --- | --- |
| ![Novo item](img/new-item-desktop.png) | ![Dashboard mobile](img/dashboard-mobile.png) |

## Como Rodar

Requisitos:

- Node.js 20+
- npm
- Docker, para o PostgreSQL local

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Para desenvolvimento local com Docker, use pelo menos:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_web?schema=public"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_web?schema=public"
JWT_SECRET="troque-esta-chave-em-producao"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="troque-esta-chave-authjs-em-producao"
ALLOW_INSECURE_COOKIES="true"
```

Suba o banco, aplique as migrations e rode o seed:

```bash
npm run db:up
npm run db:migrate
npm run seed
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse:

- `http://localhost:3000/auth/login`
- `http://localhost:3000/dashboard`

Usuário criado pelo seed:

- Email: `teste@example.com`
- Senha: `Teste123!`

## Variáveis de Ambiente

As variáveis completas estão em [`.env.example`](.env.example). As principais são:

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão principal do Prisma |
| `DIRECT_URL` | Conexão direta para migrations |
| `JWT_SECRET` | Assinatura dos tokens internos |
| `NEXTAUTH_URL` | URL base do NextAuth |
| `NEXTAUTH_SECRET` | Assinatura das sessões NextAuth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login com Google |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Login com GitHub |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Login com Discord |
| `ALLOW_INSECURE_COOKIES` | Cookies sem HTTPS em desenvolvimento |
| `CORS_ALLOWED_ORIGINS` | Origens externas permitidas para a API |

## Scripts

```bash
npm run dev              # desenvolvimento
npm run build            # build de produção com geração do service worker
npm start                # servidor de produção local
npm run db:up            # sobe PostgreSQL local
npm run db:down          # derruba PostgreSQL local
npm run db:migrate       # aplica migrations Prisma
npm run seed             # cria dados locais de teste
npm run lint             # lint
npm run test             # testes unitários
npm run test:coverage    # cobertura
npm run test:e2e         # testes E2E
```

## PWA e Offline

O comportamento offline deve ser validado em build de produção:

```bash
npm run build
npm start
```

Depois de abrir o app, faça login, visite o dashboard e aguarde o service worker assumir o controle da página. A experiência offline cobre navegação e leitura com dados já carregados; ações de escrita ainda exigem conexão.

## Qualidade

Última validação local:

- `npm run test -- --run`: 148 testes unitários passando.
- `npm run test:coverage`: 96.21% statements/lines, 92.34% branches, 94.33% functions.

Os testes E2E ficam em [`tests/e2e`](tests/e2e) e usam Playwright. Para rodar contra um banco separado, configure `E2E_DATABASE_URL`.

## Estrutura

```text
app/          rotas, páginas, API routes e componentes
contexts/     contexto de autenticação
hooks/        hooks de dados, status online e instalação PWA
lib/          schemas, client HTTP e utilitários
prisma/       schema e migrations
public/       manifest, ícones, screenshots e service worker
server/       autenticação, Prisma, CORS, logs e scripts
tests/        testes unitários e E2E
```

## Deploy

O projeto está preparado para deploy na Vercel com PostgreSQL. Configure as variáveis de ambiente do banco, autenticação e OAuth no painel da Vercel e use o build padrão do projeto:

```bash
npm run build
```

O `seed` é bloqueado para bancos remotos por segurança. Para popular produção, use um script controlado e separado.
