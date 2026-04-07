# app-web

Aplicação web para gestão de coleções pessoais, com autenticação, dashboard visual, categorias, campos customizáveis e suporte a múltiplas fotos por item. O projeto usa Next.js App Router no frontend e API routes com Prisma no backend, tudo em TypeScript strict.

## Visão geral

Hoje o projeto está organizado em três frentes principais:

- Landing page pública em `/` com proposta visual do produto
- Fluxo de autenticação em `/auth/login` e `/auth/register`
- Área logada em `/dashboard` para criar, editar, filtrar e favoritar itens da coleção

## Principais recursos

- Autenticação com JWT em cookie HTTP-only e senha com `bcryptjs`
- **OAuth integrado**: Google, GitHub e Discord (auto-cria usuário, gerencia tokens)
- Cadastro e login com validação via `zod` + `react-hook-form`
- Dashboard com busca em tempo real (título + descrição), paginação (12 itens/página, máx 50), filtros por categoria e status
- Alternância entre visualização em grade e lista
- Destaque de favoritos e status como `owned`, `wishlist` e `loaned`
- Estatísticas de coleção (total, favoritos, wishlist, próprios, emprestados)
- CRUD de itens com descrição, categoria e campos customizáveis
- Upload de múltiplas fotos por item (máx 2) com auto-otimização (redimensiona 1600px max, JPEG 0.82)
- Ordenação e galeria de fotos
- Categorias por usuário, com criação direta pelo formulário
- Soft delete em itens (não destrutivo, marca `deletedAt`)
- React Query com cache inteligente (stale time 30s)
- Notificações com `react-hot-toast`
- Cobertura de testes: **97.81%** (135 testes passando)
- Testes unitários com Vitest e E2E com Playwright

## Stack

| Camada | Tecnologias |
| --- | --- |
| Framework | Next.js 16.2.1 + React 19.2.4 |
| Linguagem | TypeScript 5 |
| UI | Tailwind CSS 4 + Lucide React |
| Forms | React Hook Form + Zod |
| Dados no cliente | TanStack React Query 5 + Axios |
| Banco | Prisma ORM + PostgreSQL |
| Auth | JWT + bcryptjs |
| Testes | Vitest + Testing Library + Playwright |
| Observabilidade | Pino |

## Estrutura

```text
app/
  api/                  rotas de autenticação, categorias, itens e fotos
  auth/                 páginas públicas de login e registro
  dashboard/            dashboard, detalhe e criação/edição de itens
  components/           componentes da landing, auth, dashboard e UI

contexts/               contexto de autenticação no cliente
hooks/                  hooks de dados para itens, categorias e campos customizáveis
lib/                    schemas, client HTTP e utilitários compartilhados
server/                 auth, Prisma, validação, CORS, logs e scripts
prisma/                 schema e migrations do banco
tests/                  suíte unitária e E2E
```

## Quick start

### Requisitos

- Node.js 20+
- npm

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Copie [`.env.example`](/Users/david/Documents/projetos/app-web/.env.example) para `.env.local` e ajuste os valores:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/app_web?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/app_web?schema=public"
JWT_SECRET="troque-esta-chave-em-producao"
ALLOW_INSECURE_COOKIES="false"
CORS_ALLOWED_ORIGINS="http://localhost:3001"
LOG_LEVEL="debug"
```

Observações:

- o projeto agora está preparado para PostgreSQL, que é compatível com deploy na Vercel
- `DIRECT_URL` pode usar o mesmo valor de `DATABASE_URL` em ambiente local
- em ambiente local, `ALLOW_INSECURE_COOKIES="true"` pode ser útil se você estiver testando sem HTTPS
- `CORS_ALLOWED_ORIGINS` só é necessário se houver outro frontend consumindo a API

### Rodando Localmente com PostgreSQL

O projeto está configurado para desenvolvimento local com PostgreSQL via Docker Compose.

#### 1. Configure o `.env.local`

Use este setup local padrão:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_web?schema=public"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_web?schema=public"
JWT_SECRET="troque-esta-chave-em-producao"
ALLOW_INSECURE_COOKIES="true"
```

#### 2. Suba o banco local

```bash
npm run db:up
```

O container sobe um PostgreSQL local com:

- banco: `app_web`
- usuário: `postgres`
- senha: `postgres`
- porta: `5432`

#### 3. Aplique as migrations

```bash
npx prisma migrate dev
```

Se quiser apenas conferir o status do banco ou acompanhar logs:

```bash
npm run db:logs
```

#### 4. Rode o seed

```bash
npm run seed
```

O seed cria um usuário de teste:

- Email: `teste@example.com`
- Senha: `Teste123!`

Observação:

- o `seed` agora só executa quando `DATABASE_URL` ou `DIRECT_URL` apontam para banco local (`localhost`, `127.0.0.1` ou `postgres`)
- se alguém tentar rodar o comando com banco remoto, o script falha de propósito para proteger produção

#### 5. Suba a aplicação

```bash
npm run dev
```

Abra:

- `http://localhost:3000/` para a landing page
- `http://localhost:3000/auth/login` para login
- `http://localhost:3000/dashboard` para a área autenticada

#### 6. Login local de desenvolvimento

Credenciais prontas após o seed:

- Email: `teste@example.com`
- Senha: `Teste123!`

### Desenvolvimento

```bash
npm run dev
```

Abra:

- `http://localhost:3000/` para a landing page
- `http://localhost:3000/auth/login` para login
- `http://localhost:3000/dashboard` para a área autenticada

## Scripts

```bash
npm run dev              # ambiente de desenvolvimento
npm run build            # build de produção
npm start                # inicia o servidor via server/scripts/start.mjs
npm run db:up            # sobe o PostgreSQL local com Docker Compose
npm run db:down          # derruba o PostgreSQL local
npm run db:logs          # acompanha logs do PostgreSQL local
npm run db:migrate       # roda migrations locais com Prisma
npm run seed             # cria usuário de teste
npm run lint             # lint com ESLint
npm run test             # testes unitários/integration com Vitest
npm run test:watch       # Vitest em watch mode
npm run test:coverage    # cobertura de testes
npm run test:e2e         # testes end-to-end com Playwright
npm run test:e2e:ui      # runner visual do Playwright
npm run test:e2e:report  # abre o report do Playwright
```

## Deploy na Vercel

O projeto já está configurado para deploy com Prisma + Vercel:

- o Prisma foi preparado para `postgresql`
- existe migration inicial em `prisma/migrations/`
- [`vercel.json`](/Users/david/Documents/projetos/app-web/vercel.json) executa `npm run build`
- `npm run build` já executa `prisma generate && next build`

Para subir:

1. Crie um banco PostgreSQL gerenciado, como Neon, Supabase ou Vercel Postgres.
2. Configure na Vercel as env vars `DATABASE_URL`, `JWT_SECRET`, `ALLOW_INSECURE_COOKIES` e, se necessário, `CORS_ALLOWED_ORIGINS`.
3. Faça o deploy do projeto normalmente na Vercel.
4. Se quiser popular um usuário inicial em produção, prefira um script separado e controlado; o `npm run seed` deste projeto é bloqueado para banco remoto.

Observação:

- o script `npm start` continua útil para execução fora da Vercel, mas na plataforma a execução passa pelo fluxo padrão do Next.js

## API principal

Rotas implementadas hoje:

- `POST /api/auth/register` — Login com credenciais
- `POST /api/auth/login` — Cadastro de novo usuário
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Verifica autenticação atual
- `GET/POST /api/auth/[...nextauth]` — **OAuth** (Google, GitHub, Discord)
- `GET /api/categories` — Lista categorias
- `POST /api/categories`
- `GET /api/custom-fields`
- `POST /api/custom-fields`
- `DELETE /api/custom-fields`
- `GET /api/items`
- `POST /api/items`
- `GET /api/items/[id]`
- `PUT /api/items/[id]`
- `DELETE /api/items/[id]`
- `POST /api/items/[id]/photos`
- `DELETE /api/items/[id]/photos/[photoId]`

## Modelagem

O banco gira em torno de **6 entidades**:

- `User` — Usuário com autenticação JWT e OAuth
- `Item` — Item da coleção (com soft delete via `deletedAt`)
- `Category` — Categorias por usuário
- `CustomField` — Campos dinâmicos por usuário
- `Photo` — Fotos do item (máx 2, com ordem e auto-otimização)
- `OAuthAccount` — Contas OAuth (Google, GitHub, Discord)

Cada usuário possui suas próprias categorias, campos customizáveis e itens. Cada item pode ter status, favorito, dados extras serializados e várias fotos ordenadas. Items com `deletedAt` preenchido são tratados como deletados sem perder dados.

## Testes

**Cobertura:** 97.81% statements/lines, 94.62% branches, 94% functions — **135 testes passando**

Testes incluem:

- Autenticação (JWT, OAuth, credentials)
- Schemas de validação e regras de negócio
- CORS, upload de foto e helpers de API
- E2E para autenticação, dashboard e itens

Para testes E2E locais, use `E2E_DATABASE_URL` para apontar banco PostgreSQL separado.

Arquivos de referência:

- [`tests/unit/auth.test.ts`](/Users/david/Documents/projetos/app-web/tests/unit/auth.test.ts)
- [`tests/unit/auth-options.test.ts`](/Users/david/Documents/projetos/app-web/tests/unit/auth-options.test.ts) — OAuth e NextAuth
- [`tests/unit/get-authenticated-user.test.ts`](/Users/david/Documents/projetos/app-web/tests/unit/get-authenticated-user.test.ts) — Autenticação
- [`tests/unit/item-schema.test.ts`](/Users/david/Documents/projetos/app-web/tests/unit/item-schema.test.ts)
- [`tests/e2e/auth.spec.ts`](/Users/david/Documents/projetos/app-web/tests/e2e/auth.spec.ts)
- [`tests/e2e/dashboard.spec.ts`](/Users/david/Documents/projetos/app-web/tests/e2e/dashboard.spec.ts)
- [`tests/e2e/items.spec.ts`](/Users/david/Documents/projetos/app-web/tests/e2e/items.spec.ts)

## Detalhes Técnicos

### Dados & Caching

- **React Query**: Stale time 30s para revalidação automática
- **Paginação**: Padrão 12 itens/página, máximo 50
- **Busca**: Busca em tempo real (título + descrição)
- **Soft Delete**: Items marcados com `deletedAt` não são retornados por padrão

### Upload de Fotos

- **Limite**: 2 fotos por item
- **Tamanho**: Máx 4MB (limite Vercel)
- **Formatos**: JPEG, PNG, WEBP, GIF
- **Auto-otimização**: Redimensiona para 1600px máximo, converte para JPEG com qualidade 0.82
- **Armazenamento**: Base64 no banco (otimizado para Vercel)

### Observabilidade

- **Pino Logger**: Logs estruturados no servidor (LOG_LEVEL configurável)
- **Erros**: Validação Zod com mensagens claras
- **Request Logging**: Middleware com timestamp e duração

### OAuth

- **Providers**: Google, GitHub, Discord
- **Auto-criação**: Novo usuário criado automaticamente no primeiro login
- **Atualização**: Tokens refresh automático
- **Fallback**: Suporta transição entre OAuth e credenciais

## Convenções do projeto

- TypeScript em modo strict
- App Router e separação clara entre código de `app/`, `hooks/`, `lib/` e `server/`
- Preferência por reutilizar padrões já existentes antes de criar novos arquivos
- Mudanças novas devem vir acompanhadas de testes quando fizer sentido
- Cobertura mínima de testes: 90%

As diretrizes detalhadas para agentes e automações estão em [`.github/copilot-instructions.md`](/Users/david/Documents/projetos/app-web/.github/copilot-instructions.md).
