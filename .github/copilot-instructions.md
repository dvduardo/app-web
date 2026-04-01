---
title: "Agent Instructions for app-web Project"
version: "1.0.0"
description: "Prompt de instruções para qualquer IA instanciada no projeto app-web. Define princípios de desenvolvimento, fluxo de decisão e padrões esperados."
target: ["copilot", "claude", "chatgpt", "grok"]
lastUpdated: "2026-03-31"
---

# 🤖 Agent Instructions - app-web

Este documento define como qualquer IA deve trabalhar com este projeto. Segue princípios de qualidade, objetividade e eficiência.

---

## 1. Contexto do Projeto

**Stack Principal:**
- **Framework**: Next.js 16.2.1 (React 19.2.4)
- **Linguagem**: TypeScript (strict mode)
- **Banco de Dados**: Prisma ORM + sqlite3 (melhor-sqlite3)
- **Autenticação**: JWT + bcryptjs
- **UI/Styling**: Tailwind CSS 4 + Lucide React
- **State Management**: TanStack React Query 5.96.0
- **HTTP Client**: Axios
- **PWA**: Service Worker + manifest.json
- **Off-sync**: Custom hook para sincronização offline

**Objetivos Principais:**
- Aplicação web com autenticação robusta
- Dashboard com gestão de itens + fotos
- Funcionalidade offline-first (PWA)
- Performance otimizada + acessibilidade

---

## 2. Princípios Fundamentais

### ✋ **Não Criar Arquivos Desnecessários**

**Regra**: Antes de criar qualquer novo arquivo, verifique se já existe:
1. Um padrão similar no projeto
2. Uma estrutura que possa ser reutilizada
3. Se a criação é realmente necessária para a feature solicitada

**Ação**:
- Pesquise o codebase (pastas `lib/`, `components/`, `app/api/`) para padrões existentes
- Se encontrar nada similar: procure na documentação do framework se há uma forma padrão esperada
- **Não crie**: hooks auxiliares, utilitários ou componentes sem antes validar inexistência local

**Exemplo de ❌ NÃO FAZER:**
```
Usuário: "Crie um hook para validar email"
❌ ERRADO: Criar imediatamente libs/hooks/useEmailValidation.ts
✅ CERTO: Buscar em lib/ → encontrar password.ts → verificar se há padrão de validação → reutilizar ou estender existente
```

---

### 🔍 **Pesquisar Antes de Perguntar**

**Regra**: Quando tiver dúvida, **não pergunte ao usuário imediatamente**. Pesquise primeiro:

1. **Dúvidas sobre comportamento de library/API** → Pesquise documentação oficial (Next.js, Prisma, React, Tailwind)
2. **Dúvidas sobre padrão local do projeto** → Busque no codebase (grep, análise de arquivos similares)
3. **Dúvidas sobre compatibilidade/versão** → Verifique package.json e histórico de migrações

**Apenas pergunte ao usuário se:**
- A resposta não estiver em nenhuma fonte (docs, codebase, estilo do projeto)
- Houver múltiplas formas igualmente válidas e você precisar de preferences do usuário
- A decisão impactar arquitetura/design e merece input humano

**Exemplo**:
```
Dúvida: "Como fazer paginação em React Query?"
→ Pesquise docs React Query → encontre exemplo oficial
→ SÓ pergunte se o projeto tiver um padrão específico diferente

Dúvida: "Que nome dar a este novo endpoint?"
→ Busque em app/api/ por convenções existentes
→ SÓ pergunte se nenhum padrão for claro
```

---

### 📊 **Analisar Contexto - Propor Apenas Melhorias Viáveis**

**Regra**: Antes de sugerir uma melhoria, valide:

1. **Custo**: Quanto tempo/complexidade custa? (linhas de código, novas dependências, mudanças em múltiplos arquivos)
2. **Benefício**: O ganho é significativo? (performance +10%? UX +20%? código -20%?)
3. **Risco**: Pode quebrar algo? Precisa testes?

**Se Custo >> Benefício** → Não proponha (silenciar)  
**Se Custo ≈ Benefício** → Pergunte: "*Vi uma possível melhoria, mas requer [X]. Vale a pena?*"  
**Se Benefício >> Custo** → Implemente ou proponha com confiança

**Exemplo de ❌ NÃO FAZER:**
```
Usuário: "Faça um login simples"
❌ ERRADO: Propor refatoração de toda arquitetura, adicionar Redis, cache distribuído, etc.
✅ CERTO: Implementar funcionalidade simples. Se depois surgir gargalo, aí sim sugerir melhoria
```

---

### 🎯 **Ser Objetivo nas Explicações**

**Regra**: Explicações claras e concisas. Máximo 2–3 frases + contexto quando necessário.

- Evite floreios, divagações, ou histórico desnecessário
- Vá direto ao ponto
- Se precisar explicar algo complexo: use 1 frase estrutural + 1 detalhe + exemplos se for código

**Exemplo**:
```
❌ LONGO: "React Query é uma library que ajuda a gerenciar estado no seu aplicativo..."
✅ CONCISO: "React Query controla cache e sincronização de dados server. Use useQuery() para GET e useMutation() para POST."
```

---

### 💭 **Explicar Antes de Perguntar**

**Regra**: Sempre que for fazer uma pergunta, precedente de contexto breve:

```
[BREVE CONTEXTO] → [PERGUNTA CLARA]
```

**Formato esperado:**
```
"Para autenticação persistente após logout, preciso saber uma preferência:
Você quer limpar cookies/localStorage imediatamente ou gradualmente? 
(Afeta segurança vs UX)"
```

**Exemplo de ❌ NÃO FAZER:**
```
❌ ERRADO: "Qual library de validação?"
✅ CERTO: "Para validar dados do formulário de registro, há 3 opções populares: Zod (type-safe), Yup (simples), ou custom. 
          Qual você prefere?"
```

---

### 🚫 **Não Inventar - Escopo Fixo**

**Regra**: Implemente **exatamente** o que foi pedido. Zero invenção, zero scope creep.

- Não adicione features "por se forem úteis"
- Não refatore código adjacente "enquanto está lá"
- Não mude padrões sem aprovação explícita
- Se vir algo que *realmente* mereca refatoring: **pergunte**, não implemente

**Exemplo**:
```
Pedido: "Crie um endpoint para exportar itens como CSV"
❌ ERRADO: Criar também import, scheduled exports, webhooks, etc.
✅ CERTO: Apenas o endpoint CSV solicitado. Ponto.
```

---

### ❓ **Em Dúvida, Pergunte ao Usuário**

**Regra**: Ambiguidade = pergunta imediata. Não assuma.

Se a solicitação:
- Tem múltiplas interpretações viáveis
- Requer dados que você não tem (preferências técnicas, UX choice, trade-offs)
- Impacta segurança ou arquitetura

**Então pergunte.** Estruturado conforme a regra anterior: contexto + pergunta clara.

---

## 3. Diretrizes Técnicas

### ✅ O Que Fazer

**Código & Arquitetura**:
- Siga padrões Next.js 16+ (app router, server/client components)
- Use TypeScript strict mode — sem `any`, sem `// @ts-ignore`
- Reutilize hooks e utilitários existentes em `lib/`
- Componentes devem ser funcionais (React 19+)

**Dependências**:
- Use versões consolidadas (conforme package.json) — não pule para latest
- Antes de adicionar nova dependência: pesquise se framework já oferece (Next.js, React, TypeScript nativa)
- Justifique qualquer novo package (why? how? cost?)

**Performance & Qualidade**:
- Otimize queries (Prisma + React Query caching)
- Minimize re-renders (useMemo, useCallback onde apropriado)
- Teste lógica complexa antes de commit
- Siga padrões de acessibilidade (ARIA, semantic HTML)

### ❌ O Que Evitar

- Criar short-cuts ou hacks ("vou fix depois")
- Dependências experimentais ou muito novas
- Code duplication sem tentar abstrair
- Ignorar tipos ou usar TypeScript incorretamente
- Mutations diretas em state (usar React patterns)

---

## 4. Fluxo de Decisão

Quando receber uma solicitação, siga este fluxo:

```
┌─ Solicitação Ambígua?
│  ├─ SIM → [CONTEXTO] + [PERGUNTA] → Aguarde resposta
│  └─ NÃO → Continuar
│
├─ Requer Arquivo Novo?
│  ├─ SIM → Pesquisar codebase por padrões existentes
│  │       ├─ Encontrou padrão? → Reutilizar/estender
│  │       └─ Nada encontrado? → Criar, justificando
│  └─ NÃO → Continuar
│
├─ Precisa de Pesquisa?
│  ├─ (Dúvida sobre behavior de lib/API) → Pesquisar docs
│  ├─ (Dúvida sobre padrão local) → Buscar codebase
│  ├─ (Nenhuma resposta) → Perguntar ao usuário
│  └─ (Respondido) → Continuar
│
├─ Va Implementar ou Propor Melhoria?
│  ├─ MELHORIA → Validar Custo vs Benefício
│  │            ├─ Custo >> Benefício? → Silenciar
│  │            ├─ Custo ≈ Benefício? → Perguntar
│  │            └─ Benefício >> Custo? → Implementar
│  └─ IMPLEMENTAÇÃO → Seguir diretrizes técnicas
│
└─ Explicar & Comunicar
   ├─ Se fez pergunta → [Contexto] + [Pergunta]
   ├─ Se implementou → 2–3 frases + resumo do que foi feito
   └─ Se propôs → Explicar antes de questionar
```

---

## 5. Resumo de Ações Rápidas

| Situação | Ação |
|---------|------|
| Novo arquivo | Buscar padrão similar → reutilizar ou justificar |
| Dúvida técnica | Pesquisar docs/codebase → só perguntar se não encontrar |
| Melhoria insight | Validar ROI → sugerir ou silenciar |
| Explicação solicitada | 2–3 frases max + exemplo se código |
| Feedback pedido | [CONTEXTO breve] + [PERGUNTA] |
| Implementação | Exatamente o pedido, zero extras |
| Ambiguidade | Pergunta imediata, não assuma |

---

## ✨ Encerramento

Este documento define a qualidade esperada. Qualquer IA que trabalhe neste projeto deve:

✅ Ser eficiente (não criar extras)  
✅ Ser informada (pesquisar antes de perguntar)  
✅ Ser objetiva (explicações claras e curtas)  
✅ Ser humana (perguntar antes de assumir)  
✅ Ser rigorosa (TypeScript, padrões, análise)  

**Se tiver dúvida sobre como proceder, releia este documento ou pergunte ao usuário.**
