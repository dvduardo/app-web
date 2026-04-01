# 🚀 Guia de Deployment - Railway

## ⚡ Setup Rápido (5 minutos)

### **Pré-requisitos:**
- ✅ Conta GitHub
- ✅ Conta Railway ([railway.app](https://railway.app))
- ✅ Código commitado no GitHub

---

## 📋 **Passo 1: Preparar o repositório**

```bash
# Instalar dependências (sem better-sqlite3)
npm install

# Remover node_modules antigos com SQLite
rm -rf node_modules package-lock.json

# Reinstalar clean
npm install

# Gerar JWT_SECRET seguro
openssl rand -base64 32

# Criar arquivo .env.local com o secret:
echo 'JWT_SECRET="seu-secret-gerado-acima"' >> .env.local

# Commit
git add .
git commit -m "Preparar para production no Railway"
git push origin main
```

---

## 🚂 **Passo 2: Deploy no Railway**

1. **Abrir [railway.app](https://railway.app)**
2. **Login com GitHub**
3. **Dashboard → New Project → Deploy from GitHub Repo**
4. **Selecionar `app-web`**
5. **Railway detecta Next.js e faz build automaticamente**

---

## ⚙️ **Passo 3: Configurar Variáveis de Ambiente**

No **Railway Dashboard → Seu Projeto:**

1. **Clique em "Variables"**
2. **Adicione:**

```
NODE_ENV=production
JWT_SECRET=seu-secret-aleatorio-aqui
```

3. **Railway já cria `DATABASE_URL` automaticamente!** ✅

---

## 📦 **Passo 4: Conectar Banco de Dados PostgreSQL**

1. **No Railway, clique "Add Service"**
2. **Selecione "PostgreSQL"**
3. **Railway conecta automaticamente:**
   - Cria variável `DATABASE_URL`
   - Vincula ao seu projeto

4. **Executar migrações Prisma:**
   ```bash
   # Railway roda automaticamente após build
   # Se precisar manual:
   npm run prisma migrate deploy
   ```

---

## 🌐 **Passo 5: URL Pública**

Railway gera URL automática:
- Acesse: `https://seu-projeto-random.railway.app`
- Veja em Railway → Seu Projeto → "Generate Domain"

---

## ✅ **Verificar Deploy**

```bash
# Ver logs no Railway
Railway Dashboard → Seu Projeto → Logs

# Procure por:
# > next build
# > npm start
# ▲ Using @next/env to load environment variables from .env.local
# > next start
# ready - started server on ::, port 3000
```

---

## 🔐 **Segurança em Produção**

| Item | Ação |
|------|------|
| **JWT_SECRET** | ✅ Genere com `openssl rand -base64 32` |
| **DATABASE** | ✅ PostgreSQL em Railway (cloud-hosted) |
| **HTTPS** | ✅ Railway fornece automaticamente |
| **Certificados** | ✅ Não precisa (remova `/certs`) |

---

## 🚨 **Troubleshooting**

### **"Module not found: better-sqlite3"**
```bash
# Solução: Já removemos do package.json
npm install
git push
```

### **"DATABASE_URL not set"**
- Railway precisa de 2-3 minutos para criar PostgreSQL
- Aguarde e redeploay

### **"Connection refused"**
- Verifique se PostgreSQL está rodando em Railway
- Veja em Railway → Variables → DATABASE_URL

---

## 📊 **Plano Gratuito Railway**

- ✅ $5/mês crédito gratuito
- ✅ Suficiente para projeto pequeno
- ✅ Sem limite de tempo
- ✅ PostgreSQL + Node.js ilimitado

---

## 🎯 **Próximos Passos**

1. ✅ Commit código com mudanças
2. ✅ Fazer deploy no Railway
3. ✅ Testar em `https://seu-projeto.railway.app`
4. ✅ Domínio customizado (opcional): Railway → Settings → Domains

---

**Pronto!** Sua app está em produção! 🚀
