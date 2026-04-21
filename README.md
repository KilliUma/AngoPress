# AngoPress

**Plataforma SaaS de Mailing de Imprensa para Angola**

## Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Base de dados | PostgreSQL 16 |
| Fila de e-mails | BullMQ + Redis |
| Serviço de e-mail | Amazon SES |
| Armazenamento | AWS S3 |
| Deploy Frontend | Vercel |
| Deploy API | Railway / VPS |

## Estrutura do Monorepo

```
angopress/
├── apps/
│   ├── api/          ← NestJS (Backend)
│   └── web/          ← React TS (Dashboard)
├── packages/
│   └── typescript-config/  ← Configs TS partilhadas
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose

## Setup Local

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd angopress
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env com os valores reais
```

### 3. Iniciar base de dados e Redis

```bash
docker-compose up -d
```

### 4. Executar migrations e seed

```bash
npm run db:migrate
npm run db:seed
```

### 5. Iniciar em desenvolvimento

```bash
npm run dev
```

- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/docs
- **Dashboard:** http://localhost:5173

## Credenciais de Desenvolvimento

| Utilizador | Email | Password |
|-----------|-------|----------|
| Admin | admin@angopress.ao | Admin@AngoPress2026! |
| Demo/Cliente | demo@empresa.ao | Cliente@123! |

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Iniciar todos os apps em desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Lint em todos os workspaces |
| `npm run typecheck` | Verificação de tipos TS |
| `npm run db:migrate` | Executar migrations Prisma |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Popular BD com dados de desenvolvimento |

## Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add JWT refresh token rotation
fix(campaigns): correct send quota validation
chore: update dependencies
```

## Módulos da API

| Módulo | Descrição |
|--------|-----------|
| `auth` | Autenticação JWT, refresh tokens |
| `users` | Gestão de utilizadores e perfis |
| `journalists` | Base de dados de jornalistas |
| `mailing-lists` | Listas de mailing privadas |
| `press-releases` | Criação e gestão de press releases |
| `campaigns` | Campanhas de disparo |
| `dispatch` | Motor de envio (BullMQ + SES) |
| `analytics` | Tracking de abertura e cliques |
| `subscriptions` | Planos e assinaturas |
| `admin` | Painel administrativo |
| `uploads` | Upload de ficheiros para S3 |
| `webhooks` | Receção de eventos SES/SNS |
