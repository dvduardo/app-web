# app-web

Aplicação web PWA para gestão de coleções pessoais com autenticação segura, suporte a fotos e campos customizáveis. Construída com Next.js 16 + React 19.

## ✨ Features

- **Autenticação segura** — JWT + bcryptjs com validação de senha robusta
- **Gestão de itens** — CRUD completo com suporte a múltiplas fotos e ordenação
- **Campos customizáveis** — Crie campos personalizados por item
- **Interface responsiva** — Tailwind CSS 4 com design moderno
- **Testes automatizados** — Cobertura com Vitest (unit/integration) + Playwright (E2E)
- **Type-safe** — TypeScript strict mode em toda a aplicação

## 🛠️ Stack

| Componente | Versão |
|-----------|--------|
| **Framework** | Next.js 16.2.1 + React 19.2.4 |
| **Linguagem** | TypeScript 5 |
| **Banco de Dados** | Prisma ORM 5.18 + SQLite |
| **Estilo** | Tailwind CSS 4 + Lucide React |
| **State** | TanStack React Query 5.96 |
| **HTTP** | Axios 1.14 |
| **Autenticação** | JWT 9.0 + bcryptjs 3.0 |
| **Testing** | Vitest 1.0 + Playwright 1.59 |

## 🚀 Quick Start

### Requisitos
- Node.js 18+ e npm

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-repo/app-web.git
cd app-web

# 2. Instale dependências
npm install

# 3. Configure banco de dados
npx prisma migrate dev

# 4. Inicie dev server
npm run dev

# 5. Abra no navegador
# http://localhost:3000 → redireciona para /dashboard após login
```

## 📋 Comandos

```bash
npm run dev              # Iniciar dev server
npm run build            # Build para produção
npm start                # Rodar app.js (custom server)
npm run lint             # Verificar código com ESLint
npm run test             # Testes unitários (Vitest)
npm run test:watch       # Vitest em watch mode
npm run test:coverage    # Relatório de cobertura
npm run test:e2e         # Testes E2E (Playwright)
npm run test:e2e:ui      # UI do Playwright
```

## 📁 Estrutura

```
app/
├── api/
│   ├── auth/            → Login, register, logout, me
│   ├── items/           → CRUD de itens + fotos
│   └── custom-fields/   → Gerenciar campos personalizados
├── auth/                → Páginas de login e registro
├── dashboard/           → Dashboard principal + detalhe de itens
├── components/          → Componentes reutilizáveis (forms, cards, providers)
└── lib/                 → Lógica compartilhada (auth, API, helpers, tipos)

frontend/
├── hooks/               → Hooks de dados e estado da interface
├── lib/                 → Utilitários voltados ao cliente
└── providers/           → Providers do frontend

backend/
├── auth/                → Helpers de autenticação/autorização
├── scripts/             → Scripts de execução
└── validation/          → Validação e parsing da API

tests/
└── e2e/                 → Testes end-to-end com Playwright
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de dados (SQLite)
DATABASE_URL="file:./dev.db"

# Autenticação
JWT_SECRET="sua-chave-secreta-super-segura"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 🤝 Contribuindo

Este projeto segue padrões específicos de desenvolvimento.

### Requisitos

- **TypeScript strict mode** — Sem `any`, sem `// @ts-ignore`
- **Padrões Next.js 16** — App router, server/client components, API routes
- **Reutilização** — Busque padrões similares em `/lib` antes de criar novos arquivos
- **Testes obrigatórios** — Feature nova = testes unitários + E2E
- **ESLint deve passar** — `npm run lint`

### Workflow

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Implemente + adicione testes
3. Rode: `npm run test && npm run test:e2e && npm run lint`
4. Faça commit e envie PR

Leia [.github/copilot-instructions.md](.github/copilot-instructions.md) para princípios detalhados.

## 📝 Licença

MIT

---

**Precisa de ajuda?** Verifique os testes em `/tests/e2e` e `/app/lib/__tests__/` para exemplos de como usar a API e componentes.
