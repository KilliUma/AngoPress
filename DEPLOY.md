# Deploy AngoPress — Vercel + Railway

## Arquitectura de produção

```
Landing (Next.js)  →  Vercel  →  angopress.ao
Web SPA (Vite)     →  Vercel  →  app.angopress.ao
API (NestJS)       →  Railway →  api.angopress.ao
PostgreSQL         →  Neon    →  (gerido)
Redis              →  Upstash →  (gerido)
```

---

## 1. Pré-requisitos

1. Conta [Vercel](https://vercel.com)
2. Conta [Railway](https://railway.app)
3. Conta [Neon](https://neon.tech) — PostgreSQL gratuito
4. Conta [Upstash](https://upstash.com) — Redis gratuito
5. Repositório no GitHub com o código

---

## 2. Base de dados — Neon

1. Criar projeto em https://neon.tech
2. Copiar a `DATABASE_URL` (formato: `postgres://user:pass@host/db?sslmode=require`)
3. Guardar para usar na Railway

---

## 3. Redis — Upstash

1. Criar base de dados Redis em https://upstash.com
2. Copiar `REDIS_URL` (formato: `rediss://user:pass@host:port`)
3. Guardar para usar na Railway

---

## 4. API — Railway

1. Aceder a https://railway.app → New Project → Deploy from GitHub repo
2. Selecionar o repositório AngoPress
3. Configurar o serviço:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. Em **Variables**, adicionar todas as variáveis:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<Neon URL>
REDIS_URL=<Upstash URL>
REDIS_TLS=true
CLIENT_URL=https://app.angopress.ao
LANDING_URL=https://angopress.ao
JWT_SECRET=<openssl rand -hex 64>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<openssl rand -hex 64>
JWT_REFRESH_EXPIRES_IN=7d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<chave AWS>
AWS_SECRET_ACCESS_KEY=<secret AWS>
AWS_SES_FROM_EMAIL=noreply@angopress.ao
AWS_SES_FROM_NAME=AngoPress
AWS_S3_BUCKET=angopress-uploads
AWS_S3_BASE_URL=https://angopress-uploads.s3.amazonaws.com
```

5. Após o deploy, correr as migrations:
   - Railway → serviço da API → **Shell**:
   ```bash
   npx prisma migrate deploy
   ```
6. Copiar o domínio gerado (ex: `https://angopress-api.up.railway.app`)
7. Opcionalmente, adicionar domínio customizado `api.angopress.ao`

---

## 5. Landing — Vercel (projeto 1)

1. https://vercel.com → New Project → Import repositório
2. Configurar:
   - **Framework**: Next.js
   - **Root Directory**: `apps/landing`
   - **Build Command**: `cd ../.. && npx turbo run build --filter=@angopress/landing`
   - **Install Command**: `cd ../.. && npm install`
3. Em **Environment Variables**:

```env
API_URL=https://api.angopress.ao
APP_URL=https://app.angopress.ao
```

4. Adicionar domínio customizado `angopress.ao` (ou deixar o subdomínio Vercel)

---

## 6. Web App — Vercel (projeto 2)

1. https://vercel.com → New Project → Import **o mesmo repositório**
2. Configurar:
   - **Framework**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && npx turbo run build --filter=@angopress/web`
   - **Install Command**: `cd ../.. && npm install`
   - **Output Directory**: `dist`
3. Em **Environment Variables**:

```env
VITE_API_URL=https://api.angopress.ao
```

4. Adicionar domínio customizado `app.angopress.ao`

---

## 7. Ordem de deploy

```
1. Neon       → criar BD e copiar DATABASE_URL
2. Upstash    → criar Redis e copiar REDIS_URL
3. Railway    → deploy API + migrations
4. Vercel #1  → deploy Landing (com URL da API)
5. Vercel #2  → deploy Web App (com URL da API)
6. Railway    → atualizar CLIENT_URL e LANDING_URL com domínios finais
```

---

## 8. Verificar após deploy

- [ ] `https://api.angopress.ao/api/v1/health` → `{ "status": "ok" }`
- [ ] Landing abre sem erros
- [ ] Web app consegue fazer login
- [ ] Registo de jornalista funciona na landing

---

## Gerar secrets JWT

```bash
# No terminal local:
openssl rand -hex 64   # JWT_SECRET
openssl rand -hex 64   # JWT_REFRESH_SECRET
```
