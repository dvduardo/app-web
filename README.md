# app-web

Aplicação web para gestão de coleções pessoais, com autenticação, dashboard visual, categorias, campos customizáveis e suporte a múltiplas fotos por item. O projeto usa Next.js App Router no frontend e API routes com Prisma no backend, tudo em TypeScript strict.

## Visão geral

Hoje o projeto está organizado em três frentes principais:

- Landing page pública em `/` com proposta visual do produto
- Fluxo de autenticação em `/auth/login` e `/auth/register`
- Área logada em `/dashboard` para criar, editar, filtrar e favoritar itens da coleção

## Principais recursos

- Autenticação com JWT em cookie HTTP-only e senha com `bcryptjs`
- Cadastro e login com validação via `zod` + `react-hook-form`
- Dashboard com busca, paginação, filtros por categoria e status
- Alternância entre visualização em grade e lista
- Destaque de favoritos e status como `owned`, `wishlist` e `loaned`
- CRUD de itens com descrição, categoria e campos customizáveis
- Upload de múltiplas fotos por item com ordenação e galeria
- Categorias por usuário, com criação direta pelo formulário
- Notificações com `react-hot-toast`
- Cobertura de testes unitários com Vitest e fluxos E2E com Playwright

## Stack

| Camada | Tecnologias |
| --- | --- |
| Framework | Next.js 16.2.1 + React 19.2.4 |
| Linguagem | TypeScript 5 |
| UI | Tailwind CSS 4 + Lucide React |
| Forms | React Hook Form + Zod |
| Dados no cliente | TanStack React Query 5 + Axios |
| Banco | Prisma ORM + SQLite |
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
prisma/                 schema e bancos SQLite locais
public/                 previews HTML de exploração visual
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

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="troque-esta-chave-em-producao"
ALLOW_INSECURE_COOKIES="false"
CORS_ALLOWED_ORIGINS="http://localhost:3001"
LOG_LEVEL="debug"
```

Observações:

- `DATABASE_URL="file:./dev.db"` usa o SQLite local esperado pelo Prisma
- em ambiente local, `ALLOW_INSECURE_COOKIES="true"` pode ser útil se você estiver testando sem HTTPS
- `CORS_ALLOWED_ORIGINS` só é necessário se houver outro frontend consumindo a API

### Banco e seed

```bash
npx prisma generate
npx prisma db push
npm run seed
```

O seed cria um usuário de teste:

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
npm run seed             # cria usuário de teste
npm run lint             # lint com ESLint
npm run test             # testes unitários/integration com Vitest
npm run test:watch       # Vitest em watch mode
npm run test:coverage    # cobertura de testes
npm run test:e2e         # testes end-to-end com Playwright
npm run test:e2e:ui      # runner visual do Playwright
npm run test:e2e:report  # abre o report do Playwright
```

## API principal

Rotas implementadas hoje:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/categories`
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

O banco hoje gira em torno de cinco entidades:

- `User`
- `Item`
- `Category`
- `CustomField`
- `Photo`

Cada usuário possui suas próprias categorias, campos customizáveis e itens. Cada item pode ter status, favorito, dados extras serializados e várias fotos ordenadas.

## Previews visuais

Arquivos de exploração visual disponíveis em `public/`:

- [`public/home-web-proposal-preview.html`](/Users/david/Documents/projetos/app-web/public/home-web-proposal-preview.html)
- [`public/dashboard-web-proposal-preview.html`](/Users/david/Documents/projetos/app-web/public/dashboard-web-proposal-preview.html)
- [`public/login-apparition-preview.html`](/Users/david/Documents/projetos/app-web/public/login-apparition-preview.html)

Você pode abrir diretamente no navegador local, por exemplo:

```bash
open public/home-web-proposal-preview.html
```

## Testes

Cobertura atual inclui:

- testes de autenticação, schemas, utilitários e regras de negócio
- testes de CORS, upload de foto e helpers de API
- testes E2E para autenticação, dashboard e itens

Arquivos de referência:

- [`tests/unit/auth.test.ts`](/Users/david/Documents/projetos/app-web/tests/unit/auth.test.ts)
- [`tests/unit/item-schema.test.ts`](/Users/david/Documents/projetos/app-web/tests/unit/item-schema.test.ts)
- [`tests/e2e/auth.spec.ts`](/Users/david/Documents/projetos/app-web/tests/e2e/auth.spec.ts)
- [`tests/e2e/dashboard.spec.ts`](/Users/david/Documents/projetos/app-web/tests/e2e/dashboard.spec.ts)
- [`tests/e2e/items.spec.ts`](/Users/david/Documents/projetos/app-web/tests/e2e/items.spec.ts)

## Convenções do projeto

- TypeScript em modo strict
- App Router e separação clara entre código de `app/`, `hooks/`, `lib/` e `server/`
- Preferência por reutilizar padrões já existentes antes de criar novos arquivos
- Mudanças novas devem vir acompanhadas de testes quando fizer sentido

As diretrizes detalhadas para agentes e automações estão em [`.github/copilot-instructions.md`](/Users/david/Documents/projetos/app-web/.github/copilot-instructions.md).
