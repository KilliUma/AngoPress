╔══════════════════════════════════════════════════════════════════════════════════╗
║                          ANGOPRESS — ARQUITECTURA FUNCIONAL                      ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO                                                          │
│                                                                                  │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐ │
│  │   apps/landing       │   │     apps/web          │   │    apps/web (admin)  │ │
│  │   Next.js 14         │   │  React 19 + Vite      │   │  React 19 + Vite     │ │
│  │   Porto 3002         │   │  Porto 5173           │   │  /admin/*            │ │
│  │                      │   │                       │   │                      │ │
│  │  • Hero / Features   │   │  • Auth (Login/Reg.)  │   │  • Dashboard Admin   │ │
│  │  • Pricing (SSR)     │   │  • Dashboard          │   │  • Utilizadores      │ │
│  │  • CTA → /registo    │   │  • Jornalistas        │   │  • Assinaturas       │ │
│  └──────────────────────┘   │  • Listas de Mailing  │   │  • Jornalistas       │ │
│                             │  • Press Releases     │   │  • Planos            │ │
│                             │  • Campanhas          │   └──────────────────────┘ │
│                             │  • Analytics          │                             │
│                             │  • Meu Plano          │                             │
│                             └──────────────────────┘                             │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ HTTPS / REST API
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE API  —  apps/api  (NestJS 11 + Fastify)  Porto 3001                  │
│                                                                                  │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ AuthModule │  │UsersModule  │  │JournalistsM. │  │  MailingListsModule    │ │
│  │            │  │             │  │              │  │                        │ │
│  │ • Register │  │ • Perfil   │  │ • CRUD       │  │ • CRUD listas          │ │
│  │ • Login    │  │ • Password  │  │ • Paginação  │  │ • Add/Remove contatos  │ │
│  │ • Refresh  │  │   Update   │  │ • Filtros    │  │                        │ │
│  │ • Logout   │  │             │  │ • CSV Import │  │                        │ │
│  │ JWT 15min  │  │             │  │ • CSV Export │  │                        │ │
│  └────────────┘  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                                  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────────────────────┐│
│  │PressReleasesModule│  │DispatchModule   │  │     AnalyticsModule              ││
│  │                  │  │                 │  │                                  ││
│  │ • CRUD           │  │ • Criar campanha│  │ GET /track/open/:token (pixel)   ││
│  │ • Editor TipTap  │  │ • Quota check   │  │ GET /track/click/:token?url=     ││
│  │ • Upload S3      │  │ • Enqueue BullMQ│  │ • Eventos: open/click/bounce/    ││
│  │ • Preview HTML   │  │ • Scheduling    │  │   delivery/unsubscribe           ││
│  │ • Agendamento    │  │ • BullMQ Worker │  │ • Agregações por campanha        ││
│  └──────────────────┘  │   → SES Batch  │  │ • Relatório individual           ││
│                        └─────────────────┘  └──────────────────────────────────┘│
│                                                                                  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────────────────────┐│
│  │SubscriptionsM.   │  │  AdminModule    │  │      WebhooksModule              ││
│  │                  │  │                 │  │                                  ││
│  │ • CRUD Planos    │  │ • Utilizadores  │  │ POST /webhooks/ses (SNS)         ││
│  │ • Solicitar sub. │  │ • Assinaturas   │  │  • Bounce → marcar inválido      ││
│  │ • Activação admin│  │ • Stats globais │  │  • Complaint → opt-out           ││
│  │ • Expiração auto │  │ • Aprovações    │  │  • Delivery → confirmar          ││
│  │ • Quota mensal   │  └─────────────────┘  │                                  ││
│  └──────────────────┘                       │ GET /unsubscribe/:token          ││
│                                             └──────────────────────────────────┘│
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────┐
         ▼                             ▼                           ▼
┌────────────────┐          ┌──────────────────┐        ┌─────────────────────┐
│  PostgreSQL    │          │  Redis + BullMQ  │        │   Serviços AWS      │
│  (Prisma ORM) │          │                  │        │                     │
│                │          │  Filas:          │        │ ┌─────────────────┐ │
│  13 modelos:  │          │  • email-queue   │        │ │  Amazon SES     │ │
│  • User       │          │  • schedule-queue│        │ │  Disparo email  │ │
│  • SubPlan    │◄─────────│                  │        │ │  Webhooks SNS   │ │
│  • Subscription│         │  BullMQ Worker:  │        │ └─────────────────┘ │
│  • Journalist │          │  • Lê em batch  │        │                     │
│  • PresRelease│          │  • Personaliza  │────────►│ ┌─────────────────┐ │
│  • Campaign   │          │  • Chama SES    │        │ │    AWS S3       │ │
│  • CampaignRec│          │  • Actualiza DB │        │ │  Anexos PDF     │ │
│  • EmailEvent │          └──────────────────┘        │ │  Imagens        │ │
│  • MailingList│                                       │ └─────────────────┘ │
│  • MLContact  │                                       └─────────────────────┘
│  • JournReg.  │
│  • Upload     │
│  • RefreshTok │
└────────────────┘
