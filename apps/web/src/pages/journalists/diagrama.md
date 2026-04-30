
---

## MAPA MENTAL — PAPÉIS E FUNCIONALIDADES

```mermaid
mindmap
  root((AngoPress))
    PÚBLICO
      Landing Page
        Ver planos e preços
        Ver funcionalidades
        CTA Registo empresa
        CTA Registo jornalista
      Autenticação
        Criar conta empresa
        Login
        Recuperar password
      Jornalistas
        Submeter pedido de registo
      Tracking
        Pixel de abertura de email
        Redirect de clique
        Opt-out por link
    ADMIN
      Dashboard
        Total de utilizadores
        Assinaturas activas
        Pedidos pendentes
        Campanhas enviadas
        Jornalistas cadastrados
        Press releases publicados
      Notificações
        Assinaturas pendentes
        Registos de jornalistas para revisão
      Utilizadores
        Listar e pesquisar
        Filtrar por role e status
        Activar ou bloquear conta
      Assinaturas
        Ver todos os pedidos
        Activar assinatura manualmente
        Definir data de expiração
        Adicionar notas admin
        Alterar plano do utilizador
      Planos
        Criar novo plano
        Editar plano existente
        Desactivar plano
        Definir preço e quota de envios
        Definir funcionalidades do plano
      Jornalistas
        Ver pedidos de registo
        Aprovar pedido
        Rejeitar pedido
    CLIENT
      Autenticação e Perfil
        Login com JWT
        Renovação automática de token
        Editar perfil
        Alterar password
      Assinatura
        Ver planos disponíveis
        Solicitar plano
        Mudar de plano
        Ver estado do plano
        Monitorizar quota de envios
        Notificações de expiração
      Base de Jornalistas
        Listar jornalistas
        Pesquisar por nome e email
        Filtrar por tipo de media
        Filtrar por provincia e cidade
        Ver perfil do jornalista
        Adicionar jornalista manualmente
        Editar jornalista
      Mailing Lists
        Criar lista
        Editar lista
        Eliminar lista
        Adicionar jornalistas à lista
        Remover jornalistas da lista
      Press Releases
        Criar com editor TipTap
        Editar rascunho
        Publicar press release
        Arquivar press release
        Duplicar press release
        Fazer upload de anexos PDF
        Remover anexos
        Pré-visualizar como email
      Campanhas
        Criar campanha
        Seleccionar press release
        Seleccionar destinatários
        Enviar imediatamente
        Agendar envio
        Ver relatório da campanha
        Taxa de abertura
        Taxa de cliques
        Bounces e erros
      Analytics
        Métricas globais do utilizador
        Métricas por campanha
        Histórico de eventos
```

---

## DIAGRAMA DE ACESSO POR PAPEL

```mermaid
flowchart TD
    U([Utilizador]) --> PUB[Acesso Público]
    U --> AUTH{Autenticado?}

    PUB --> LP[Landing Page]
    PUB --> REG[Registo Empresa]
    PUB --> JREG[Registo Jornalista]
    PUB --> FPASS[Recuperar Password]
    PUB --> TRACK[Tracking Email\nopen · click · unsubscribe]

    AUTH -->|Não| LOGIN[Página de Login]
    AUTH -->|Sim| ROLE{Papel?}

    ROLE -->|CLIENT| CLIENT_AREA[Área Cliente]
    ROLE -->|ADMIN| ADMIN_AREA[Área Admin]

    CLIENT_AREA --> C1[Dashboard]
    CLIENT_AREA --> C2[Jornalistas]
    CLIENT_AREA --> C3[Mailing Lists]
    CLIENT_AREA --> C4[Press Releases]
    CLIENT_AREA --> C5[Campanhas]
    CLIENT_AREA --> C6[Analytics]
    CLIENT_AREA --> C7[Assinatura]
    CLIENT_AREA --> C8[Perfil]

    C4 --> C4A[Editor TipTap]
    C4 --> C4B[Upload S3]
    C4 --> C4C[Publicar / Arquivar]
    C5 --> C5A[Envio imediato]
    C5 --> C5B[Agendamento BullMQ]
    C5 --> C5C[Relatório]
    C7 --> C7A[Solicitar plano]
    C7 --> C7B[Estado da subscrição]
    C7 --> C7C[Quota de envios]

    ADMIN_AREA --> A1[Dashboard Global]
    ADMIN_AREA --> A2[Utilizadores]
    ADMIN_AREA --> A3[Assinaturas]
    ADMIN_AREA --> A4[Planos]
    ADMIN_AREA --> A5[Jornalistas]
    ADMIN_AREA --> A6[Notificações]

    A2 --> A2A[Activar / Bloquear conta]
    A3 --> A3A[Activar assinatura]
    A3 --> A3B[Definir data expiração]
    A4 --> A4A[Criar / Editar planos]
    A4 --> A4B[Desactivar plano]
    A5 --> A5A[Aprovar registo]
    A5 --> A5B[Rejeitar registo]

    style PUB fill:#e0f2fe,stroke:#0284c7
    style CLIENT_AREA fill:#dcfce7,stroke:#16a34a
    style ADMIN_AREA fill:#fef9c3,stroke:#ca8a04
    style LOGIN fill:#fee2e2,stroke:#dc2626
```

---

## FLUXO DE SUBSCRIÇÃO

```mermaid
sequenceDiagram
    actor C as Cliente
    actor A as Admin
    participant API as API NestJS
    participant DB as PostgreSQL
    participant SES as AWS SES

    C->>API: POST /subscriptions/request { planId }
    API->>DB: upsert Subscription { status: PENDING }
    API-->>C: 201 { status: PENDING }

    Note over C: Notificação no sino\n"Pedido em análise"

    A->>API: GET /admin/notifications
    API->>DB: COUNT pendingSubscriptions
    API-->>A: { pendingSubscriptions: N }
    Note over A: Notificação no sino\n"N pedidos aguardam aprovação"

    A->>API: POST /admin/subscriptions/:userId/activate
    API->>DB: update Subscription { status: ACTIVE, expiresAt }
    API->>DB: update User { status: ACTIVE } se PENDING
    API->>SES: sendSubscriptionActivated email
    API-->>A: 200 { status: ACTIVE }

    Note over C: Polling 15s detecta activação
    C->>API: GET /subscriptions/my
    API-->>C: { status: ACTIVE, expiresAt }
    Note over C: Notificação "Plano activado"
```

---

## FLUXO DE CAMPANHA

```mermaid
sequenceDiagram
    actor C as Cliente
    participant API as API NestJS
    participant BQ as BullMQ Queue
    participant W as Worker
    participant SES as AWS SES
    participant DB as PostgreSQL

    C->>API: POST /campaigns { pressReleaseId, listIds, subject }
    API->>DB: check quota sendsUsed < plan.maxSendsMonth
    API->>DB: create Campaign { status: DRAFT }
    API-->>C: 201 { id, status: DRAFT }

    C->>API: POST /campaigns/:id/send
    API->>DB: create CampaignRecipient[] { status: PENDING }
    API->>DB: update Campaign { status: QUEUED }
    API->>BQ: enqueue job
    API-->>C: 200 { status: QUEUED }

    loop Batch de envio
        W->>BQ: dequeue job
        W->>DB: fetch recipients batch
        W->>SES: sendEmail (com pixel + links rastreados)
        W->>DB: update CampaignRecipient { status: SENT }
        W->>DB: increment sendsUsed
    end

    DB->>DB: update Campaign { status: SENT }

    Note over SES: Webhooks SNS (bounce/delivery/complaint)
    SES->>API: POST /webhooks/ses
    API->>DB: create EmailEvent
    API->>DB: update Journalist.bounceCount / isOptedOut

    C->>API: GET /campaigns/:id/report
    API->>DB: aggregate EmailEvents
    API-->>C: { opens, clicks, bounces, delivered }
```

---

## MODELO DE DADOS SIMPLIFICADO

```mermaid
erDiagram
    USER ||--o| SUBSCRIPTION : tem
    USER ||--o{ PRESS_RELEASE : cria
    USER ||--o{ CAMPAIGN : cria
    USER ||--o{ MAILING_LIST : cria
    USER ||--o{ REFRESH_TOKEN : possui

    SUBSCRIPTION }o--|| SUBSCRIPTION_PLAN : usa

    PRESS_RELEASE ||--o{ PRESS_RELEASE_ATTACHMENT : tem
    PRESS_RELEASE ||--o{ CAMPAIGN : origina

    CAMPAIGN ||--o{ CAMPAIGN_RECIPIENT : tem
    CAMPAIGN_RECIPIENT }o--|| JOURNALIST : para
    CAMPAIGN_RECIPIENT ||--o{ EMAIL_EVENT : gera

    MAILING_LIST ||--o{ MAILING_LIST_CONTACT : contém
    MAILING_LIST_CONTACT }o--|| JOURNALIST : referencia

    JOURNALIST_REGISTRATION ||--o| JOURNALIST : aprovado_como

    USER {
        uuid id
        string name
        string email
        enum role "ADMIN | CLIENT"
        enum status "ACTIVE | INACTIVE | PENDING"
        string company
    }

    SUBSCRIPTION {
        uuid id
        enum status "PENDING | ACTIVE | EXPIRED | CANCELLED"
        datetime activatedAt
        datetime expiresAt
        int sendsUsed
    }

    SUBSCRIPTION_PLAN {
        uuid id
        string name
        int maxSendsMonth
        int priceMonthlyAoa
        boolean isActive
    }

    CAMPAIGN {
        uuid id
        string name
        string subject
        enum status "DRAFT | QUEUED | SENDING | SENT | FAILED | SCHEDULED"
        datetime scheduledAt
        datetime sentAt
        int totalRecipients
    }

    JOURNALIST {
        uuid id
        string name
        string email
        string outlet
        enum mediaType "TV | RADIO | PRINT | DIGITAL | PODCAST | MAGAZINE"
        boolean isOptedOut
        int bounceCount
    }

    EMAIL_EVENT {
        uuid id
        enum eventType "DELIVERED | OPENED | CLICKED | BOUNCED | COMPLAINED | UNSUBSCRIBED"
        string clickedUrl
        datetime createdAt
    }
```

---

## ARQUITECTURA DE SEGURANÇA

```mermaid
flowchart LR
    REQ([Pedido HTTP]) --> GS[Global Guards]

    GS --> JG{JwtAuthGuard}
    JG -->|@Public decorator| SKIP[Passa directo]
    JG -->|Token inválido| E401[401 Unauthorized]
    JG -->|Token válido| RG{RolesGuard}

    RG -->|@Roles decorator ausente| PASS[Handler]
    RG -->|Role insuficiente| E403[403 Forbidden]
    RG -->|Role satisfeita| PASS

    subgraph Tokens
        AT[Access Token\nJWT · 15 min]
        RT[Refresh Token\nDB · revogável]
        AT -->|expirado| RF[POST /auth/refresh]
        RF -->|RT válido| AT2[Novo Access Token]
        RF -->|RT inválido/revogado| E401B[401 → Logout]
    end

    style E401 fill:#fee2e2,stroke:#dc2626
    style E403 fill:#fef9c3,stroke:#ca8a04
    style PASS fill:#dcfce7,stroke:#16a34a
    style SKIP fill:#e0f2fe,stroke:#0284c7
```